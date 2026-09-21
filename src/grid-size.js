"use strict";

const { normalizeGridWithRotation } = require("./grid-rotation");

const AXES = ["x", "y", "z"];
const VARS = ["gx", "gy", "gz"];

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeSizeStep(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.size_step must be an object keyed by x, y, or z");
  }
  const keys = Object.keys(value).sort();
  const unknown = keys.filter((key) => !AXES.includes(key));
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `grid.size_step has unsupported axis key(s): ${unknown.join(", ")}`);
  }
  if (!keys.length) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.size_step must provide at least one active grid axis");
  }
  const deltas = [null, null, null];
  for (const key of keys) {
    const delta = value[key];
    if (!Array.isArray(delta) || delta.length !== 3 || delta.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.size_step.${key} must be three finite size deltas`);
    }
    if (delta.every((item) => item === 0)) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.size_step.${key} must change at least one size component`);
    }
    deltas[AXES.indexOf(key)] = delta.slice();
  }
  return { ok: true, deltas };
}

function leafOf(node) {
  let current = node;
  while (current && Number.isInteger(current.repeat) && Array.isArray(current.body)) current = current.body[0];
  return current;
}

function expr(base, component, deltas) {
  let out = base;
  for (let axis = 0; axis < 3; axis += 1) {
    if (!deltas[axis] || deltas[axis][component] === 0) continue;
    out = ["+", out, ["*", ["var", VARS[axis]], deltas[axis][component]]];
  }
  return out;
}

function rotationDeltas(grid) {
  return AXES.map((axis) => grid.rot_step && Array.isArray(grid.rot_step[axis]) ? grid.rot_step[axis] : null);
}

function proveDomain(grid, sizeDeltas) {
  const target = grid.part;
  const counts = grid.counts;
  const step = grid.step;
  const pos0 = Array.isArray(target.pos) ? target.pos : [0, 0, 0];
  const rot0 = Array.isArray(target.rot) ? target.rot : [0, 0, 0];
  const size0 = Array.isArray(target.size) ? target.size : [1, 1, 1];
  const rotDeltas = rotationDeltas(grid);
  const seen = new Set();

  for (let gx = 0; gx < counts[0]; gx += 1) {
    for (let gy = 0; gy < counts[1]; gy += 1) {
      for (let gz = 0; gz < counts[2]; gz += 1) {
        const index = [gx, gy, gz];
        const pos = pos0.map((base, axis) => base + index[axis] * step[axis]);
        const rot = rot0.map((base, component) => base + index.reduce((sum, item, axis) => sum + (rotDeltas[axis] ? item * rotDeltas[axis][component] : 0), 0));
        const size = size0.map((base, component) => base + index.reduce((sum, item, axis) => sum + (sizeDeltas[axis] ? item * sizeDeltas[axis][component] : 0), 0));
        if (pos.concat(rot, size).some((value) => !Number.isFinite(value))) {
          return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/size progression produces a non-finite generated state at [${gx},${gy},${gz}]`);
        }
        if (size.some((value) => value <= 0)) {
          return hold("HOLD_FORM_GRID_INVALID", `grid size progression must stay greater than zero across the complete Cartesian domain; generated state [${gx},${gy},${gz}] is invalid`);
        }
        const key = JSON.stringify(pos.concat(rot, size));
        if (seen.has(key)) {
          return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/size progression produces a duplicate authored state at [${gx},${gy},${gz}]`);
        }
        seen.add(key);
      }
    }
  }
  return { ok: true };
}

function normalizeGridWithSize(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid) || grid.size_step === undefined) {
    return normalizeGridWithRotation(grid);
  }

  const size = normalizeSizeStep(grid.size_step);
  if (!size.ok) return size;

  const validationGrid = { ...grid };
  delete validationGrid.size_step;
  if (Array.isArray(grid.counts) && grid.counts.length === 3 && Array.isArray(grid.step) && grid.step.length === 3) {
    validationGrid.step = grid.step.slice();
    for (let axis = 0; axis < 3; axis += 1) {
      if (grid.counts[axis] > 1 && validationGrid.step[axis] === 0 && size.deltas[axis]) validationGrid.step[axis] = 1;
    }
  }

  const normalized = normalizeGridWithRotation(validationGrid);
  if (!normalized.ok) return normalized;
  if (normalized.target_kind !== "part") {
    return hold("HOLD_FORM_GRID_INVALID", "grid.size_step is only valid for a primitive part target");
  }

  for (let axis = 0; axis < 3; axis += 1) {
    if (size.deltas[axis] && grid.counts[axis] < 2) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.size_step.${AXES[axis]} requires grid.counts[${axis}] of at least 2 so the size progression can take effect`);
    }
  }

  const closure = proveDomain(grid, size.deltas);
  if (!closure.ok) return closure;

  const leaf = leafOf(normalized.data);
  const pos0 = Array.isArray(grid.part.pos) ? grid.part.pos.slice() : [0, 0, 0];
  const size0 = Array.isArray(grid.part.size) ? grid.part.size.slice() : [1, 1, 1];
  leaf.pos = pos0.map((base, axis) => grid.counts[axis] === 1 || grid.step[axis] === 0 ? base : ["+", base, ["*", ["var", VARS[axis]], grid.step[axis]]]);
  leaf.size = size0.map((base, component) => expr(base, component, size.deltas));
  return normalized;
}

module.exports = { normalizeGridWithSize };
