"use strict";

const { AXES, affineVector, affineScalar } = require("./grid-progression");

// Internal generated-state representation for grid scale after the scale lane
// has validated the authored scale_step/base-scale contract.
function generatedScaleFromGrid(grid, index) {
  const target = grid && grid.instance ? grid.instance : {};
  const step = grid && grid.scale_step;

  if (!step) {
    if (Array.isArray(target.scale)) return target.scale.slice();
    return [target.scale === undefined ? 1 : target.scale];
  }

  const first = Object.keys(step).sort()[0];
  const vector = first !== undefined && Array.isArray(step[first]);
  if (!vector) {
    const base = target.scale === undefined ? 1 : target.scale;
    const deltas = AXES.map((axis) => typeof step[axis] === "number" ? step[axis] : null);
    return [affineScalar(base, index, deltas)];
  }

  const base = target.scale === undefined ? [1, 1, 1] : target.scale;
  const deltas = AXES.map((axis) => Array.isArray(step[axis]) ? step[axis].slice() : null);
  return affineVector(base, index, deltas);
}

module.exports = { generatedScaleFromGrid };
