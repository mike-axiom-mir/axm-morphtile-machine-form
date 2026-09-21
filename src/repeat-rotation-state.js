"use strict";

const { linearVector } = require("./repeat-progression");

function finiteVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function authoredTarget(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat)) return null;
  return repeat.part !== undefined ? repeat.part : repeat.instance;
}

function rotationStateFromRepeat(repeat) {
  const target = authoredTarget(repeat);
  return {
    base: target && finiteVector3(target.rot) ? target.rot.slice() : [0, 0, 0],
    delta: repeat && finiteVector3(repeat.rot_step) ? repeat.rot_step.slice() : [0, 0, 0]
  };
}

function generatedRotationFromRepeat(repeat, index) {
  const state = rotationStateFromRepeat(repeat);
  return linearVector(state.base, index, state.delta);
}

module.exports = {
  rotationStateFromRepeat,
  generatedRotationFromRepeat
};
