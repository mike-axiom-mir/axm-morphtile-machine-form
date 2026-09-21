"use strict";

const { normalizeGridWithRotation, rotationDeltasFromGrid } = require("./grid-rotation");
const {
  AXES,
  leafOf,
  affineVector,
  affineExpression,
  axisAlignedVectorDeltas,
  progressionValidationStep,
  proveFiniteDistinctCartesian
} = require("./grid-progression");

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

function proveDomain(grid, sizeDeltas) {
  const target = grid.part;
  const counts = grid.counts;
  const step = grid.step;
  const pos0 = Array.isArray(target.pos) ? target.pos : [0, 0, 0];
  const rot0 = Array.isArray(target.rot) ? target.rot : [0, 0, 0];
  const size0 = Array.isArray(target.size) ? target.size : [1, 1, 1];
  const rotDeltas = rotationDeltasFromGrid(grid);
  const positionDeltas = axisAlignedVectorDeltas(step, counts);
  const proof = proveFiniteDistinctCartesian(
    counts,
    (index) => {
      const pos = affineVector(pos0, index, positionDeltas);
      const rot = affineVector(rot0, index, rotDeltas);
      const size = affineVector(size0, index, sizeDeltas);
      return pos.concat(rot, size);
    },
    (state) => state.slice(-3).some((value) => value <= 0) ? "size_nonpositive" : null
  );
  if (proof.ok) return proof;
  const where = `[${proof.index.join(",")}]`;
  if (proof.reason === "nonfinite") {
    return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/size progression produces a non-finite generated state at ${where}`);
  }
  if (proof.reason === "domain") {
    return hold("HOLD_FORM_GRID_INVALID", `grid size progression must stay greater than zero across the complete Cartesian domain; generated state ${where} is invalid`);
  }
  return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/size progression produces a duplicate authored state at ${where}`);
}

function normalizeGridWithSize(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid) || grid.size_step === undefined) {
    return normalizeGridWithRotation(grid);
  }

  const size = normalizeSizeStep(grid.size_step);
  if (!size.ok) return size;

  const validationGrid = { ...grid };
  delete validationGrid.size_step;
  const validationStep = progressionValidationStep(grid.step, grid.counts, size.deltas);
  if (validationStep) validationGrid.step = validationStep;

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
  const positionDeltas = axisAlignedVectorDeltas(grid.step, grid.counts);
  leaf.pos = pos0.map((base, component) => affineExpression(base, component, positionDeltas));
  leaf.size = size0.map((base, component) => affineExpression(base, component, size.deltas));
  return normalized;
}

module.exports = { normalizeGridWithSize };
