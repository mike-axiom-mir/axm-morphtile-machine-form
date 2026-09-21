"use strict";

const { linearVector } = require("./repeat-progression");

function finiteVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function sizeStateFromRepeat(repeat) {
  const target = repeat && repeat.part && typeof repeat.part === "object" && !Array.isArray(repeat.part)
    ? repeat.part
    : {};

  return {
    base: finiteVector3(target.size) ? target.size.slice() : [1, 1, 1],
    delta: repeat && finiteVector3(repeat.size_step) ? repeat.size_step.slice() : [0, 0, 0]
  };
}

function generatedSizeFromRepeat(repeat, index) {
  const state = sizeStateFromRepeat(repeat);
  return linearVector(state.base, index, state.delta);
}

module.exports = {
  sizeStateFromRepeat,
  generatedSizeFromRepeat
};
