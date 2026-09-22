"use strict";

const {
  AXES,
  affineVector,
  affineScalar,
  affineExpression,
  affineScalarExpression
} = require("./grid-progression");

function copyScale(value) {
  return Array.isArray(value) ? value.slice() : value;
}

// Internal generated/expression-state representation for grid scale. The
// scale lane still owns compatibility, positivity and active-axis validation;
// this helper only preserves one deterministic interpretation of the
// authored/default scale state after or alongside that validation.
function scaleStateFromGrid(grid) {
  const target = grid && grid.instance ? grid.instance : {};
  const step = grid && grid.scale_step;

  if (!step) {
    if (Array.isArray(target.scale)) {
      return {
        kind: "static-vector",
        base: target.scale.slice(),
        deltas: [null, null, null]
      };
    }
    return {
      kind: "static-scalar",
      base: target.scale === undefined ? 1 : target.scale,
      deltas: [null, null, null]
    };
  }

  const first = Object.keys(step).sort()[0];
  const vector = first !== undefined && Array.isArray(step[first]);
  if (!vector) {
    return {
      kind: "scalar",
      base: target.scale === undefined ? 1 : copyScale(target.scale),
      deltas: AXES.map((axis) => typeof step[axis] === "number" ? step[axis] : null)
    };
  }

  return {
    kind: "vector",
    base: target.scale === undefined ? [1, 1, 1] : copyScale(target.scale),
    deltas: AXES.map((axis) => Array.isArray(step[axis]) ? step[axis].slice() : null)
  };
}

function generatedScaleFromGrid(grid, index) {
  const state = scaleStateFromGrid(grid);
  if (state.kind === "vector") return affineVector(state.base, index, state.deltas);
  if (state.kind === "scalar") return [affineScalar(state.base, index, state.deltas)];
  if (state.kind === "static-vector") return state.base.slice();
  return [state.base];
}

function scaleExpressionStateFromGrid(grid) {
  const state = scaleStateFromGrid(grid);
  if (state.kind === "vector") {
    return state.base.map((base, component) => affineExpression(base, component, state.deltas));
  }
  if (state.kind === "scalar") {
    return affineScalarExpression(state.base, state.deltas);
  }
  if (state.kind === "static-vector") return state.base.slice();
  return state.base;
}

module.exports = {
  scaleStateFromGrid,
  generatedScaleFromGrid,
  scaleExpressionStateFromGrid
};
