const test = require("node:test");
const assert = require("node:assert/strict");

const {
  sizeStateFromRepeat,
  generatedSizeFromRepeat
} = require("../src/repeat-size-state");

test("repeat size state preserves authored primitive size and delta", () => {
  const repeat = {
    count: 4,
    step: [0, 1, 0],
    size_step: [0.25, -0.1, 0.5],
    part: { shape: "box", size: [1, 2, 3] }
  };
  const before = JSON.stringify(repeat);

  assert.deepEqual(sizeStateFromRepeat(repeat), {
    base: [1, 2, 3],
    delta: [0.25, -0.1, 0.5]
  });
  assert.deepEqual(generatedSizeFromRepeat(repeat, 2), [1.5, 1.8, 4]);
  assert.equal(JSON.stringify(repeat), before);
});

test("repeat size state uses primitive unit-size and zero-delta defaults", () => {
  const repeat = {
    count: 3,
    step: [1, 0, 0],
    part: { shape: "plane" }
  };

  assert.deepEqual(sizeStateFromRepeat(repeat), {
    base: [1, 1, 1],
    delta: [0, 0, 0]
  });
  assert.deepEqual(generatedSizeFromRepeat(repeat, 7), [1, 1, 1]);
});

test("repeat size representation stays validation-neutral for malformed authored vectors", () => {
  const repeat = {
    count: 3,
    step: [1, 0, 0],
    size_step: [0.5, 0],
    part: { shape: "box", size: [1, 2] }
  };

  assert.deepEqual(sizeStateFromRepeat(repeat), {
    base: [1, 1, 1],
    delta: [0, 0, 0]
  });
});
