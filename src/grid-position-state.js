"use strict";

const {
  affineVector,
  affineExpression,
  axisAlignedVectorDeltas
} = require("./grid-progression");

function finiteVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function countVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => Number.isInteger(item) && item >= 1);
}

function positionState(target, step, counts) {
  const authored = target && typeof target === "object" && !Array.isArray(target)
    ? target
    : {};
  const base = finiteVector3(authored.pos) ? authored.pos.slice() : [0, 0, 0];
  const normalizedStep = finiteVector3(step) ? step.slice() : [0, 0, 0];
  const normalizedCounts = countVector3(counts) ? counts.slice() : [1, 1, 1];

  return {
    base,
    step: normalizedStep,
    deltas: axisAlignedVectorDeltas(normalizedStep, normalizedCounts)
  };
}

function targetFromGrid(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid)) return undefined;
  return grid.part !== undefined ? grid.part : grid.instance;
}

function positionStateFromGrid(grid) {
  return positionState(
    targetFromGrid(grid),
    grid && grid.step,
    grid && grid.counts
  );
}

function generatedPositionFromGrid(grid, index) {
  const state = positionStateFromGrid(grid);
  return affineVector(state.base, index, state.deltas);
}

function positionExpressionState(target, step, counts) {
  const state = positionState(target, step, counts);
  return state.base.map((base, component) => affineExpression(base, component, state.deltas));
}

function positionExpressionStateFromGrid(grid) {
  const state = positionStateFromGrid(grid);
  return state.base.map((base, component) => affineExpression(base, component, state.deltas));
}

module.exports = {
  positionState,
  positionStateFromGrid,
  generatedPositionFromGrid,
  positionExpressionState,
  positionExpressionStateFromGrid
};
