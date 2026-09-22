"use strict";

const { normalizeGridWithSettings } = require("./grid-settings");
const { generatedPositionFromGrid } = require("./grid-position-state");
const { proveFiniteDistinctCartesian } = require("./grid-progression");

const PROGRESSION_KEYS = Object.freeze(["rot_step", "size_step", "scale_step", "with_step"]);

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function hasAuthoredProgression(grid) {
  return PROGRESSION_KEYS.some((key) => grid[key] !== undefined);
}

function proveBaseGridPositions(grid) {
  const proof = proveFiniteDistinctCartesian(
    grid.counts,
    (index) => generatedPositionFromGrid(grid, index)
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
