"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { progressionValidationStep } = require("../src/grid-progression");

test("progression validation movement is bounded to active multi-cell axes", () => {
  const step = [0, 0, 0];
  const counts = [3, 1, 2];
  const deltas = [[1, 0, 0], { width: 2 }, null];

  assert.deepEqual(progressionValidationStep(step, counts, deltas), [1, 0, 0]);
  assert.deepEqual(step, [0, 0, 0]);
  assert.deepEqual(counts, [3, 1, 2]);
  assert.deepEqual(deltas, [[1, 0, 0], { width: 2 }, null]);
});

test("progression validation movement recognizes scalar progression without leaking inactive axes", () => {
  assert.deepEqual(
    progressionValidationStep([0, 5, 0], [1, 1, 4], [null, null, 0.25]),
    [0, 5, 1]
  );
});

test("progression validation movement declines malformed structural inputs", () => {
  assert.equal(progressionValidationStep([0, 0], [2, 1, 1], [[1, 0, 0], null, null]), null);
  assert.equal(progressionValidationStep([0, 0, 0], [2, 1], [[1, 0, 0], null, null]), null);
  assert.equal(progressionValidationStep([0, 0, 0], [2, 1, 1], [null, null]), null);
});
