const test = require("node:test");
const assert = require("node:assert/strict");

const { scaleStateFromRepeat, generatedScaleFromRepeat } = require("../src/repeat-scale-state");

test("repeat scale state owns scalar authored/default progression state", () => {
  assert.deepEqual(
    scaleStateFromRepeat({ instance: { use: "panel", scale: 2 }, scale_step: 0.5 }),
    { kind: "scalar", base: 2, delta: 0.5 }
  );
  assert.deepEqual(
    generatedScaleFromRepeat({ instance: { use: "panel", scale: 2 }, scale_step: 0.5 }, 3),
    [3.5]
  );
  assert.deepEqual(
    scaleStateFromRepeat({ instance: { use: "panel" }, scale_step: -0.25 }),
    { kind: "scalar", base: 1, delta: -0.25 }
  );
});

test("repeat scale state owns immutable vector progression state", () => {
  const repeat = {
    instance: { use: "panel", scale: [1, 2, 3] },
    scale_step: [0.5, -0.5, 1]
  };
  const before = JSON.stringify(repeat);
  const state = scaleStateFromRepeat(repeat);
  const generated = generatedScaleFromRepeat(repeat, 2);

  assert.deepEqual(state, {
    kind: "vector",
    base: [1, 2, 3],
    delta: [0.5, -0.5, 1]
  });
  assert.deepEqual(generated, [2, 1, 5]);
  assert.equal(JSON.stringify(repeat), before);
  assert.notEqual(state.base, repeat.instance.scale);
  assert.notEqual(state.delta, repeat.scale_step);

  state.base[0] = 99;
  state.delta[0] = 99;
  generated[0] = 99;
  assert.deepEqual(repeat.instance.scale, [1, 2, 3]);
  assert.deepEqual(repeat.scale_step, [0.5, -0.5, 1]);
});

test("repeat scale state preserves static scalar/vector defaults without aliases", () => {
  assert.deepEqual(generatedScaleFromRepeat({ instance: { use: "panel" } }, 7), [1]);
  assert.deepEqual(generatedScaleFromRepeat({ instance: { use: "panel", scale: 2 } }, 7), [2]);

  const repeat = { instance: { use: "panel", scale: [2, 3, 4] } };
  const first = generatedScaleFromRepeat(repeat, 0);
  const second = generatedScaleFromRepeat(repeat, 9);
  assert.deepEqual(first, [2, 3, 4]);
  assert.deepEqual(second, [2, 3, 4]);
  assert.notEqual(first, repeat.instance.scale);
  first[0] = 99;
  assert.deepEqual(repeat.instance.scale, [2, 3, 4]);
});

test("repeat scale state does not pre-empt the scale lane compatibility validator", () => {
  const scalarBaseVectorStep = scaleStateFromRepeat({
    instance: { use: "panel", scale: 2 },
    scale_step: [1, 0, 0]
  });
  assert.deepEqual(scalarBaseVectorStep, { kind: "vector", base: 2, delta: [1, 0, 0] });

  const vectorBaseScalarStep = scaleStateFromRepeat({
    instance: { use: "panel", scale: [1, 2, 3] },
    scale_step: 1
  });
  assert.deepEqual(vectorBaseScalarStep, { kind: "scalar", base: [1, 2, 3], delta: 1 });
});
