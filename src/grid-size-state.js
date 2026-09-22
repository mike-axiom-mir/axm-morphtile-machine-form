"use strict";

const { AXES, affineVector, affineExpression } = require("./grid-progression");

function finiteVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

// Internal generated/expression-state representation for primitive grid size.
// The grid-size lane still owns validation, positivity/domain proof, target
// restrictions and HOLD authority; this helper only preserves one deterministic
// interpretation of authored/default size state after or alongside validation.
function sizeStateFromGrid(grid) {
  const target = grid && grid.part && typeof grid.part === "object" && !Array.isArray(grid.part)
    ? grid.part
    : {};
  const step = grid && grid.size_step && typeof grid.size_step === "object" && !Array.isArray(grid.size_step)
    ? grid.size_step
    : null;

  return {
    base: finiteVector3(target.size) ? target.size.slice() : [1, 1, 1],
    deltas: AXES.map((axis) => step && finiteVector3(step[axis]) ? step[axis].slice() : null)
  };
}

function generatedSizeFromGrid(grid, index) {
  const state = sizeStateFromGrid(grid);
  return affineVector(state.base, index, state.deltas);
}

function sizeExpressionStateFromGrid(grid) {
  const state = sizeStateFromGrid(grid);
  return state.base.map((base, component) => affineExpression(base, component, state.deltas));
}

module.exports = {
  sizeStateFromGrid,
  generatedSizeFromGrid,
  sizeExpressionStateFromGrid
};
