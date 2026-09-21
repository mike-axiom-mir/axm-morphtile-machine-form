"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { rotationDeltasFromGrid } = require("../src/grid-rotation");

test("rotationDeltasFromGrid keeps one canonical xyz representation without mutating authored input", () => {
  const grid = {
    rot_step: {
      z: [0, 15, -5],
      x: [2, 0, 0]
    }
  };
  const before = JSON.stringify(grid);

  const deltas = rotationDeltasFromGrid(grid);
  assert.deepEqual(deltas, [
    [2, 0, 0],
    null,
    [0, 15, -5]
  ]);

  deltas[0][0] = 99;
  deltas[2][1] = 99;
  assert.equal(JSON.stringify(grid), before);
  assert.deepEqual(rotationDeltasFromGrid(grid), [
    [2, 0, 0],
    null,
    [0, 15, -5]
  ]);
});

test("rotationDeltasFromGrid represents absent rotation progression as inactive axes", () => {
  assert.deepEqual(rotationDeltasFromGrid({}), [null, null, null]);
  assert.deepEqual(rotationDeltasFromGrid(null), [null, null, null]);
});
