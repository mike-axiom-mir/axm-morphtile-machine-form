"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { generatedScaleFromGrid } = require("../src/grid-scale-state");

test("generatedScaleFromGrid owns canonical scalar scale state without mutating authored input", () => {
  const grid = {
    counts: [3, 1, 4],
    instance: { use: "body", scale: 2 },
    scale_step: {
      z: 0.5,
      x: 1
    }
  };
  const before = JSON.stringify(grid);

  assert.deepEqual(generatedScaleFromGrid(grid, [2, 0, 3]), [5.5]);
  assert.equal(JSON.stringify(grid), before);
  assert.deepEqual(generatedScaleFromGrid(grid, [2, 0, 3]), [5.5]);
});

test("generatedScaleFromGrid owns canonical vector and static scale state without aliasing authored vectors", () => {
  const vectorGrid = {
    counts: [3, 4, 1],
    instance: { use: "body", scale: [1, 2, 3] },
    scale_step: {
      y: [0, 1, 0],
      x: [1, 0, -0.5]
    }
  };
  const before = JSON.stringify(vectorGrid);

  const generated = generatedScaleFromGrid(vectorGrid, [2, 3, 0]);
  assert.deepEqual(generated, [3, 5, 2]);
  generated[0] = 99;
  assert.equal(JSON.stringify(vectorGrid), before);
  assert.deepEqual(generatedScaleFromGrid(vectorGrid, [2, 3, 0]), [3, 5, 2]);

  const staticVector = { instance: { use: "body", scale: [2, 3, 4] } };
  const staticGenerated = generatedScaleFromGrid(staticVector, [9, 9, 9]);
  assert.deepEqual(staticGenerated, [2, 3, 4]);
  staticGenerated[0] = 99;
  assert.deepEqual(staticVector.instance.scale, [2, 3, 4]);

  assert.deepEqual(generatedScaleFromGrid({ instance: { use: "body" } }, [9, 9, 9]), [1]);
});
