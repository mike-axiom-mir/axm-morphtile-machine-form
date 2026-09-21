const test = require("node:test");
const assert = require("node:assert/strict");

const {
  rotationStateFromRepeat,
  generatedRotationFromRepeat
} = require("../src/repeat-rotation-state");

test("repeat rotation state preserves authored base and delta for primitive targets", () => {
  const repeat = {
    count: 4,
    step: [0, 1, 0],
    rot_step: [0.1, 0.2, -0.3],
    part: { shape: "box", rot: [1, 2, 3] }
  };
  const before = JSON.stringify(repeat);

  assert.deepEqual(rotationStateFromRepeat(repeat), {
    base: [1, 2, 3],
    delta: [0.1, 0.2, -0.3]
  });
  assert.deepEqual(generatedRotationFromRepeat(repeat, 2), [1.2, 2.4, 2.4]);
  assert.equal(JSON.stringify(repeat), before);
});

test("repeat rotation state uses deterministic zero defaults for instance targets", () => {
  const repeat = {
    count: 3,
    step: [1, 0, 0],
    instance: { use: "panel" }
  };

  assert.deepEqual(rotationStateFromRepeat(repeat), {
    base: [0, 0, 0],
    delta: [0, 0, 0]
  });
  assert.deepEqual(generatedRotationFromRepeat(repeat, 7), [0, 0, 0]);
});

test("repeat rotation representation stays validation-neutral for malformed authored vectors", () => {
  const repeat = {
    count: 3,
    step: [1, 0, 0],
    rot_step: [0.5, 0],
    part: { shape: "box", rot: [1, 2] }
  };

  assert.deepEqual(rotationStateFromRepeat(repeat), {
    base: [0, 0, 0],
    delta: [0, 0, 0]
  });
});
