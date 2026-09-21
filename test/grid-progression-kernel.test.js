"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  AXES,
  VARS,
  leafOf,
  affineVector,
  affineScalar,
  affineExpression,
  forEachCartesian
} = require("../src/grid-progression");

test("grid progression kernel preserves one shared axis vocabulary", () => {
  assert.deepEqual(Array.from(AXES), ["x", "y", "z"]);
  assert.deepEqual(Array.from(VARS), ["gx", "gy", "gz"]);
});

test("forEachCartesian visits every bounded index exactly once in stable order", () => {
  const seen = [];
  forEachCartesian([2, 2, 1], (index) => seen.push(index));
  assert.deepEqual(seen, [
    [0, 0, 0],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 0]
  ]);
});

test("affine helpers share the same generated-state arithmetic", () => {
  const deltas = [
    [1, 0, -1],
    null,
    [0.5, 2, 0]
  ];
  assert.deepEqual(affineVector([10, 20, 30], [2, 7, 4], deltas), [14, 28, 28]);
  assert.equal(affineScalar(5, [2, 7, 4], [1, null, -0.5]), 5);
  assert.deepEqual(
    affineExpression(10, 0, deltas),
    ["+", ["+", 10, ["*", ["var", "gx"], 1]], ["*", ["var", "gz"], 0.5]]
  );
});

test("leafOf follows compact nested grid loops to the authored target", () => {
  const leaf = { shape: "box" };
  const nested = { repeat: 2, body: [{ repeat: 3, body: [leaf] }] };
  assert.equal(leafOf(nested), leaf);
});
