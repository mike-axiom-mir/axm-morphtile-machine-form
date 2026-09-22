"use strict";

const { AXES, affineVector, affineExpression } = require("./grid-progression");

function finiteVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function targetFromGrid(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid)) return undefined;
  return grid.part !== undefined ? grid.part : grid.instance;
}

function rotationDeltasFromGrid(grid) {
  const step = grid && grid.rot_step;
  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return [null, null, null];
  }
  return AXES.map((axis) => finiteVector3(step[axis]) ? step[axis].slice() : null);
}

function rotationStateFromGrid(grid) {
  const target = targetFromGrid(grid);
  const base = target && finiteVector3(target.rot) ? target.rot.slice() : [0, 0, 0];
  return {
    base,
    deltas: rotationDeltasFromGrid(grid)
  };
}

function generatedRotationFromGrid(grid, index) {
  const state = rotationStateFromGrid(grid);
  return affineVector(state.base, index, state.deltas);
}

function rotationExpressionStateFromGrid(grid) {
  const state = rotationStateFromGrid(grid);
  return state.base.map((base, component) => affineExpression(base, component, state.deltas));
}

module.exports = {
  rotationDeltasFromGrid,
  rotationStateFromGrid,
  generatedRotationFromGrid,
  rotationExpressionStateFromGrid
};
