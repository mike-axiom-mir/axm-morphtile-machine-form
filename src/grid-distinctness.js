"use strict";

const { normalizeGridWithSettings } = require("./grid-settings");
const { affineVector, proveFiniteDistinctCartesian } = require("./grid-progression");

const PROGRESSION_KEYS = Object.freeze(["rot_step", "size_step", "scale_step", "with_step"]);

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function hasAuthoredProgression(grid) {
  return PROGRESSION_KEYS.some((key) => grid[key] !== undefined);
}

function positionDeltas(step) {
  return step.map((delta, axis) => {
    const vector = [0, 0, 0];
    vector[axis] = delta;
    return vector;
  });
}

function proveBaseGridPositions(grid) {
  const target = grid.part !== undefined ? grid.part : grid.instance;
  const basePos = Array.isArray(target.pos) ? target.pos : [0, 0, 0];
  const deltas = positionDeltas(grid.step);
  const proof = proveFiniteDistinctCartesian(
    grid.counts,
    (index) => affineVector(basePos, index, deltas)
  );

  if (proof.ok) return proof;
  const where = `[${proof.index.join(",")}]`;
  if (proof.reason === "nonfinite") {
    return hold("HOLD_FORM_GRID_INVALID", `grid position progression produces a non-finite generated state at ${where}`);
  }
  return hold("HOLD_FORM_GRID_INVALID", `grid position progression produces a duplicate authored state at ${where}`);
}

function normalizeGridWithDistinctness(grid) {
  const normalized = normalizeGridWithSettings(grid);
  if (!normalized.ok) return normalized;

  // Progression-owning layers already prove the complete authored state, so a
  // collapsed position component is allowed when another validated component
  // still distinguishes the placement. This final base-grid proof applies only
  // when translation is the complete generated state change.
  if (hasAuthoredProgression(grid)) return normalized;

  const closure = proveBaseGridPositions(grid);
  if (!closure.ok) return closure;
  return normalized;
}

module.exports = { normalizeGridWithDistinctness };
