"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  sizeStateFromGrid,
  generatedSizeFromGrid,
  sizeExpressionStateFromGrid
} = require("../src/grid-size-state");

test("grid size state owns one copied primitive authored/default representation", () => {
  const grid = {
    counts: [3, 4, 1],
    part: { shape: "box", size: [1, 2, 3] },
    size_step: {
      y: [0, 0.5, 0],
      x: [0.25, 0, -0.1]
    }
  };
  const before = JSON.stringify(grid);
  const state = sizeStateFromGrid(grid);

  assert.deepEqual(state, {
    base: [1, 2, 3],
    deltas: [[0.25, 0, -0.1], [0, 0.5, 0], null]
  });
  state.base[0] = 99;
  state.deltas[0][0] = 99;
  assert.equal(JSON.stringify(grid), before);

  assert.deepEqual(generatedSizeFromGrid(grid, [2, 3, 0]), [1.5, 3.5, 2.8]);
  assert.deepEqual(sizeExpressionStateFromGrid(grid), [
    ["+", 1, ["*", ["var", "gx"], 0.25]],
    ["+", 2, ["*", ["var", "gy"], 0.5]],
    ["+", 3, ["*", ["var", "gx"], -0.1]]
  ]);
});

test("grid size state keeps unit/static defaults and stays validation-neutral", () => {
  const staticGrid = { part: { shape: "plane" } };
  assert.deepEqual(sizeStateFromGrid(staticGrid), {
    base: [1, 1, 1],
    deltas: [null, null, null]
  });
  assert.deepEqual(generatedSizeFromGrid(staticGrid, [9, 8, 7]), [1, 1, 1]);
  assert.deepEqual(sizeExpressionStateFromGrid(staticGrid), [1, 1, 1]);

  const malformed = {
    part: { shape: "box", size: [1, 2] },
    size_step: { x: [0.5, 0], y: "bad" }
  };
  assert.doesNotThrow(() => sizeStateFromGrid(malformed));
  assert.deepEqual(sizeStateFromGrid(malformed), {
    base: [1, 1, 1],
    deltas: [null, null, null]
  });
});
