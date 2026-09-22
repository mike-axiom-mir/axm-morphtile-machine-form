const test = require("node:test");
const assert = require("node:assert/strict");

const {
  positionState,
  positionStateFromRepeat,
  generatedPositionFromRepeat,
  positionExpressionState
} = require("../src/repeat-position-state");

test("repeat position state owns copied base/delta and deterministic generated values", () => {
  const repeat = {
    count: 4,
    step: [0.5, 0, -1],
    part: { shape: "box", pos: [10, -2, 3] }
  };
  const before = JSON.stringify(repeat);

  const state = positionStateFromRepeat(repeat);
  assert.deepEqual(state, { base: [10, -2, 3], delta: [0.5, 0, -1] });
  assert.notStrictEqual(state.base, repeat.part.pos);
  assert.notStrictEqual(state.delta, repeat.step);
  assert.deepEqual(generatedPositionFromRepeat(repeat, 3), [11.5, -2, 0]);
  assert.equal(JSON.stringify(repeat), before, "state projection must not mutate caller intent");
});

test("repeat position state emits the canonical lexical-i expression representation", () => {
  const target = { pos: [10, -2, 3] };
  const step = [0.5, 0, -1];

  assert.deepEqual(positionExpressionState(target, step), [
    ["+", 10, ["*", ["var", "i"], 0.5]],
    -2,
    ["+", 3, ["*", ["var", "i"], -1]]
  ]);
});

test("repeat position representation is validation-neutral for absent or malformed authored state", () => {
  assert.deepEqual(positionState(undefined, undefined), {
    base: [0, 0, 0],
    delta: [0, 0, 0]
  });

  const malformed = {
    step: [1, 2],
    instance: { use: "panel", pos: [1, Number.POSITIVE_INFINITY, 3] }
  };
  assert.deepEqual(positionStateFromRepeat(malformed), {
    base: [0, 0, 0],
    delta: [0, 0, 0]
  });
});
