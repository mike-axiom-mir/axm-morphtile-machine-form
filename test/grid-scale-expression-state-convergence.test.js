"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  scaleStateFromGrid,
  generatedScaleFromGrid,
  scaleExpressionStateFromGrid
} = require("../src/grid-scale-state");

test("grid scale state owns one copied scalar authored/default representation", () => {
  const grid = {
    counts: [3, 1, 4],
    instance: { use: "body", scale: 2 },
    scale_step: { z: 0.5, x: 1 }
  };
  const before = JSON.stringify(grid);

  assert.deepEqual(scaleStateFromGrid(grid), {
    kind: "scalar",
    base: 2,
    deltas: [1, null, 0.5]
  });
  assert.deepEqual(generatedScaleFromGrid(grid, [2, 0, 3]), [5.5]);
  assert.deepEqual(scaleExpressionStateFromGrid(grid), [
    "+",
    ["+", 2, ["*", ["var", "gx"], 1]],
    ["*", ["var", "gz"], 0.5]
  ]);
  assert.equal(JSON.stringify(grid), before);
});

test("grid scale state owns vector expression state without aliasing authored vectors", () => {
  const grid = {
    counts: [3, 4, 1],
    instance: { use: "body", scale: [1, 2, 3] },
    scale_step: {
      y: [0, 1, 0],
      x: [1, 0, -0.5]
    }
  };
  const before = JSON.stringify(grid);
  const state = scaleStateFromGrid(grid);

  assert.deepEqual(state, {
    kind: "vector",
    base: [1, 2, 3],
    deltas: [[1, 0, -0.5], [0, 1, 0], null]
  });
  state.base[0] = 99;
  state.deltas[0][0] = 99;
  assert.equal(JSON.stringify(grid), before);

  assert.deepEqual(generatedScaleFromGrid(grid, [2, 3, 0]), [3, 5, 2]);
  assert.deepEqual(scaleExpressionStateFromGrid(grid), [
    ["+", 1, ["*", ["var", "gx"], 1]],
    ["+", 2, ["*", ["var", "gy"], 1]],
    ["+", 3, ["*", ["var", "gx"], -0.5]]
  ]);
});

test("grid scale state stays validation-neutral for static and malformed unowned progression", () => {
  const vector = { instance: { use: "body", scale: [2, 3, 4] } };
  const vectorState = scaleStateFromGrid(vector);
  assert.deepEqual(vectorState, { kind: "static-vector", base: [2, 3, 4], deltas: [null, null, null] });
  vectorState.base[0] = 99;
  assert.deepEqual(vector.instance.scale, [2, 3, 4]);
  assert.deepEqual(scaleExpressionStateFromGrid(vector), [2, 3, 4]);

  assert.deepEqual(scaleStateFromGrid({ instance: { use: "body" } }), {
    kind: "static-scalar",
    base: 1,
    deltas: [null, null, null]
  });
  assert.equal(scaleExpressionStateFromGrid({ instance: { use: "body" } }), 1);

  assert.doesNotThrow(() => scaleStateFromGrid({ instance: { use: "body" }, scale_step: { x: "bad" } }));
});
