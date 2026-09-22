"use strict";

const { linearVector, linearVectorExpression } = require("./repeat-progression");

function finiteVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function positionState(target, step) {
  const authored = target && typeof target === "object" && !Array.isArray(target)
    ? target
    : {};

  return {
    base: finiteVector3(authored.pos) ? authored.pos.slice() : [0, 0, 0],
    delta: finiteVector3(step) ? step.slice() : [0, 0, 0]
  };
}

function targetFromRepeat(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat)) return undefined;
  return repeat.part !== undefined ? repeat.part : repeat.instance;
}

function positionStateFromRepeat(repeat) {
  return positionState(targetFromRepeat(repeat), repeat && repeat.step);
}

function generatedPositionFromRepeat(repeat, index) {
  const state = positionStateFromRepeat(repeat);
  return linearVector(state.base, index, state.delta);
}

function positionExpressionState(target, step) {
  const state = positionState(target, step);
  return linearVectorExpression(state.base, state.delta);
}

module.exports = {
  positionState,
  positionStateFromRepeat,
  generatedPositionFromRepeat,
  positionExpressionState
};
