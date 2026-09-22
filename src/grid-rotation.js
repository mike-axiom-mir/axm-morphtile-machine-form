"use strict";

const { normalizeGrid } = require("./form-vocabulary");
const {
  generatedPositionFromGrid,
  positionExpressionStateFromGrid
} = require("./grid-position-state");
const {
  AXES: AXIS_KEYS,
  leafOf,
  affineVector,
  affineExpression,
  progressionValidationStep,
  proveFiniteDistinctCartesian
} = require("./grid-progression");

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

function rotationDeltasFromGrid(grid) {
  return AXIS_KEYS.map((axis) => grid && grid.rot_step && Array.isArray(grid.rot_step[axis])
    ? grid.rot_step[axis].slice()
    : null);
}

function targetOf(grid) {
  return grid.part !== undefined ? grid.part : grid.instance;
}

function proveGeneratedStates(grid, baseRot, deltas) {
  const proof = proveFiniteDistinctCartesian(grid.counts, (index) => {
    const pos = generatedPositionFromGrid(grid, index);
    const rot = affineVector(baseRot, index, deltas);
    return pos.concat(rot);
  });
  if (proof.ok) return proof;
  const where = `[${proof.index.join(",")}]`;
  if (proof.reason === "nonfinite") {
    return hold("HOLD_FORM_GRID_INVALID", `grid rotation/position progression produces a non-finite generated state at ${where}`);
  }
  return hold("HOLD_FORM_GRID_INVALID", `grid rotation/position progression produces a duplicate authored state at ${where}`);
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
  const validationStep = progressionValidationStep(grid.step, grid.counts, rotation.deltas);
  if (validationStep) legacyGrid.step = validationStep;

  const normalized = normalizeGrid(legacyGrid);
  if (!normalized.ok) return normalized;

  const counts = grid.counts.slice();
  for (let axis = 0; axis < 3; axis += 1) {
    if (rotation.deltas[axis] && counts[axis] < 2) {
      return hold(
        "HOLD_FORM_GRID_INVALID",
        `grid.rot_step.${AXIS_KEYS[axis]} requires grid.counts[${axis}] of at least 2 so the rotation progression can take effect`
      );
    }
  }

  const target = targetOf(grid);
  const baseRot = Array.isArray(target.rot) ? target.rot.slice() : [0, 0, 0];
  const closure = proveGeneratedStates(grid, baseRot, rotation.deltas);
  if (!closure.ok) return closure;

  const leaf = leafOf(normalized.data);
  leaf.pos = positionExpressionStateFromGrid(grid);
  leaf.rot = baseRot.map((base, component) => affineExpression(base, component, rotation.deltas));

  return normalized;
}

module.exports = { normalizeGridWithRotation, rotationDeltasFromGrid };
