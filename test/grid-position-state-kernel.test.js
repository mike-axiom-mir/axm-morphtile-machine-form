const test = require("node:test");
const assert = require("node:assert/strict");

const {
  positionState,
  positionStateFromGrid,
  generatedPositionFromGrid,
  positionExpressionStateFromGrid
} = require("../src/grid-position-state");

test("grid position state owns copied base/step and active-axis deltas", () => {
  const grid = {
    counts: [3, 1, 2],
    step: [2, 9, -1],
    part: { shape: "box", pos: [10, -2, 3] }
  };
  const before = JSON.stringify(grid);

  const state = positionStateFromGrid(grid);
  assert.deepEqual(state, {
    base: [10, -2, 3],
    step: [2, 9, -1],
    deltas: [[2, 0, 0], null, [0, 0, -1]]
  });
  assert.notStrictEqual(state.base, grid.part.pos);
  assert.notStrictEqual(state.step, grid.step);
  assert.deepEqual(generatedPositionFromGrid(grid, [2, 0, 1]), [14, -2, 2]);
  assert.equal(JSON.stringify(grid), before, "state projection must not mutate caller intent");
});

test("grid position state emits canonical active-axis lexical expressions", () => {
  const grid = {
    counts: [3, 1, 2],
    step: [2, 9, -1],
    instance: { use: "panel", pos: [10, -2, 3] }
  };

  assert.deepEqual(positionExpressionStateFromGrid(grid), [
    ["+", 10, ["*", ["var", "gx"], 2]],
    -2,
    ["+", 3, ["*", ["var", "gz"], -1]]
  ]);
});

test("grid position representation is validation-neutral for absent or malformed authored state", () => {
  assert.deepEqual(positionState(undefined, undefined, undefined), {
    base: [0, 0, 0],
    step: [0, 0, 0],
    deltas: [null, null, null]
  });

  const malformed = {
    counts: [2],
    step: [1, 2],
    instance: { use: "panel", pos: [1, Number.POSITIVE_INFINITY, 3] }
  };
  assert.deepEqual(positionStateFromGrid(malformed), {
    base: [0, 0, 0],
    step: [0, 0, 0],
    deltas: [null, null, null]
  });
});
