"use strict";

const { linearValue, linearVector } = require("./repeat-progression");

function copyScale(value) {
  return Array.isArray(value) ? value.slice() : value;
}

// Internal generated-state representation for repeat scale. The scale lane
// still owns compatibility/positivity validation; this helper only preserves
// one deterministic interpretation of authored/default scale state.
function scaleStateFromRepeat(repeat) {
  const target = repeat && repeat.instance ? repeat.instance : {};
  const step = repeat && repeat.scale_step;

  if (Array.isArray(step)) {
    return {
      kind: "vector",
      base: target.scale === undefined ? [1, 1, 1] : copyScale(target.scale),
      delta: step.slice()
    };
  }

  if (typeof step === "number") {
    return {
      kind: "scalar",
      base: target.scale === undefined ? 1 : copyScale(target.scale),
      delta: step
    };
  }

  if (Array.isArray(target.scale)) {
    return { kind: "static-vector", base: target.scale.slice(), delta: null };
  }

  return {
    kind: "static-scalar",
    base: target.scale === undefined ? 1 : target.scale,
    delta: 0
  };
}

function generatedScaleFromRepeat(repeat, index) {
  const state = scaleStateFromRepeat(repeat);
  if (state.kind === "vector") return linearVector(state.base, index, state.delta);
  if (state.kind === "scalar") return [linearValue(state.base, index, state.delta)];
  if (state.kind === "static-vector") return state.base.slice();
  return [state.base];
}

module.exports = { scaleStateFromRepeat, generatedScaleFromRepeat };
