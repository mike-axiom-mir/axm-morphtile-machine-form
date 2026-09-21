"use strict";

const { normalizeGrid } = require("./form-vocabulary");

const AXIS_KEYS = Object.freeze(["x", "y", "z"]);
const AXIS_VARS = Object.freeze(["gx", "gy", "gz"]);

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeRotationStep(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.rot_step must be an object keyed by x, y, or z");
  }

  const keys = Object.keys(value).sort();
  const unknown = keys.filter((key) => !AXIS_KEYS.includes(key));
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `grid.rot_step has unsupported axis key(s): ${unknown.join(", ")}`);
  }
  if (keys.length < 1) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.rot_step must provide at least one active grid axis");
  }

  const deltas = [null, null, null];
  for (const key of keys) {
    const axis = AXIS_KEYS.indexOf(key);
    const delta = value[key];
    if (!Array.isArray(delta) || delta.length !== 3 || delta.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.rot_step.${key} must be three finite rotation deltas`);
    }
    if (delta.every((item) => item === 0)) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.rot_step.${key} must change at least one rotation component`);
    }
    deltas[axis] = delta.slice();
  }

  return { ok: true, deltas };
}

function targetOf(grid) {
  return grid.part !== undefined ? grid.part : grid.instance;
}

function leafOf(node) {
  let current = node;
  while (current && typeof current === "object" && Number.isInteger(current.repeat) && Array.isArray(current.body)) {
    current = current.body[0];
  }
  return current;
}

function expressionFor(base, component, deltas) {
  let expression = base;
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = deltas[axis] && deltas[axis][component];
    if (delta === undefined || delta === 0) continue;
    expression = ["+", expression, ["*", ["var", AXIS_VARS[axis]], delta]];
  }
  return expression;
}

function proveGeneratedStates(counts, step, basePos, baseRot, deltas) {
  const seen = new Set();
  for (let gx = 0; gx < counts[0]; gx += 1) {
    for (let gy = 0; gy < counts[1]; gy += 1) {
      for (let gz = 0; gz < counts[2]; gz += 1) {
        const index = [gx, gy, gz];
        const pos = basePos.map((base, axis) => base + index[axis] * step[axis]);
        const rot = baseRot.map((base, component) => {
          let value = base;
          for (let axis = 0; axis < 3; axis += 1) {
            if (deltas[axis]) value += index[axis] * deltas[axis][component];
          }
          return value;
        });

        if (pos.some((value) => !Number.isFinite(value)) || rot.some((value) => !Number.isFinite(value))) {
          return hold(
            "HOLD_FORM_GRID_INVALID",
            `grid rotation/position progression produces a non-finite generated state at [${gx},${gy},${gz}]`
          );
        }

        const key = JSON.stringify(pos.concat(rot));
        if (seen.has(key)) {
          return hold(
            "HOLD_FORM_GRID_INVALID",
            `grid rotation/position progression produces a duplicate authored state at [${gx},${gy},${gz}]`
          );
        }
        seen.add(key);
      }
    }
  }
  return { ok: true };
}

function normalizeGridWithRotation(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid) || grid.rot_step === undefined) {
    return normalizeGrid(grid);
  }

  const rotation = normalizeRotationStep(grid.rot_step);
  if (!rotation.ok) return rotation;

  const legacyGrid = { ...grid };
  delete legacyGrid.rot_step;

  // Base grid validation remains authoritative. Private movement is inserted
  // only where a real bounded rotation progression can distinguish placements;
  // it is removed again before any candidate matter is returned.
  if (Array.isArray(grid.counts) && grid.counts.length === 3 && Array.isArray(grid.step) && grid.step.length === 3) {
    legacyGrid.step = grid.step.slice();
    for (let axis = 0; axis < 3; axis += 1) {
      if (grid.counts[axis] > 1 && legacyGrid.step[axis] === 0 && rotation.deltas[axis]) {
        legacyGrid.step[axis] = 1;
      }
    }
  }

  const normalized = normalizeGrid(legacyGrid);
  if (!normalized.ok) return normalized;

  const counts = grid.counts.slice();
  const step = grid.step.slice();
  for (let axis = 0; axis < 3; axis += 1) {
    if (rotation.deltas[axis] && counts[axis] < 2) {
      return hold(
        "HOLD_FORM_GRID_INVALID",
        `grid.rot_step.${AXIS_KEYS[axis]} requires grid.counts[${axis}] of at least 2 so the rotation progression can take effect`
      );
    }
  }

  const target = targetOf(grid);
  const basePos = Array.isArray(target.pos) ? target.pos.slice() : [0, 0, 0];
  const baseRot = Array.isArray(target.rot) ? target.rot.slice() : [0, 0, 0];
  const closure = proveGeneratedStates(counts, step, basePos, baseRot, rotation.deltas);
  if (!closure.ok) return closure;

  const leaf = leafOf(normalized.data);
  leaf.pos = basePos.map((base, axis) => {
    if (counts[axis] === 1 || step[axis] === 0) return base;
    return ["+", base, ["*", ["var", AXIS_VARS[axis]], step[axis]]];
  });
  leaf.rot = baseRot.map((base, component) => expressionFor(base, component, rotation.deltas));

  return normalized;
}

module.exports = { normalizeGridWithRotation };
