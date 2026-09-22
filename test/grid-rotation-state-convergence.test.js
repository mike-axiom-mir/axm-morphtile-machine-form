"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  rotationStateFromGrid,
  generatedRotationFromGrid,
  rotationExpressionStateFromGrid
} = require("../src/grid-rotation-state");

test("grid rotation state owns copied authored/default rotation and xyz deltas", () => {
  const grid = {
    counts: [3, 2, 1],
    step: [2, 0, 0],
    part: {
      shape: "box",
      rot: [10, -20, 30]
    },
    rot_step: {
      x: [5, 0, -2],
      y: [0, 15, 0]
    }
  };
  const before = JSON.stringify(grid);

  const state = rotationStateFromGrid(grid);
  assert.deepEqual(state, {
    base: [10, -20, 30],
    deltas: [
      [5, 0, -2],
      [0, 15, 0],
      null
    ]
  });
  assert.notStrictEqual(state.base, grid.part.rot);
  assert.notStrictEqual(state.deltas[0], grid.rot_step.x);
  assert.notStrictEqual(state.deltas[1], grid.rot_step.y);

  assert.deepEqual(generatedRotationFromGrid(grid, [2, 1, 0]), [20, -5, 26]);
  assert.equal(JSON.stringify(grid), before, "rotation state projection must not mutate caller intent");
});

test("grid rotation state emits canonical lexical gx/gy/gz expressions", () => {
  const grid = {
    counts: [3, 2, 1],
    instance: {
      use: "panel",
      rot: [10, -20, 30]
    },
    rot_step: {
      x: [5, 0, -2],
      y: [0, 15, 0]
    }
  };

  assert.deepEqual(rotationExpressionStateFromGrid(grid), [
    ["+", 10, ["*", ["var", "gx"], 5]],
    ["+", -20, ["*", ["var", "gy"], 15]],
    ["+", 30, ["*", ["var", "gx"], -2]]
  ]);
});

test("grid rotation state keeps validation authority outside the representation helper", () => {
  assert.deepEqual(rotationStateFromGrid(undefined), {
    base: [0, 0, 0],
    deltas: [null, null, null]
  });

  const malformed = {
    part: { shape: "box", rot: [1, Number.POSITIVE_INFINITY, 3] },
    rot_step: { x: [1, 2] }
  };
  assert.deepEqual(rotationStateFromGrid(malformed), {
    base: [0, 0, 0],
    deltas: [null, null, null]
  });
});
