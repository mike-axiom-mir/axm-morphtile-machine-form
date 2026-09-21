const test = require("node:test");
const assert = require("node:assert/strict");

const {
  generatedSettingValues,
  settingExpressionState
} = require("../src/repeat-setting-state");

test("repeat setting state keeps canonical key order across generated values and expressions", () => {
  const base = Object.create(null);
  base.width = 1;
  base.depth = 10;
  const step = Object.create(null);
  step.width = 2;

  const baseBefore = JSON.stringify(base);
  const stepBefore = JSON.stringify(step);

  assert.deepEqual(generatedSettingValues(base, step, 2), [10, 5]);
  assert.deepEqual(settingExpressionState(base, step), {
    depth: 10,
    width: ["+", 1, ["*", ["var", "i"], 2]]
  });
  assert.equal(JSON.stringify(base), baseBefore);
  assert.equal(JSON.stringify(step), stepBefore);
});

test("repeat setting state preserves own __proto__ settings without changing object prototype", () => {
  const base = Object.create(null);
  base.__proto__ = 2;
  base.width = 1;
  const step = Object.create(null);
  step.__proto__ = 0.5;

  const first = settingExpressionState(base, step);
  const second = settingExpressionState(base, step);

  assert.deepEqual(first, second);
  assert.equal(Object.getPrototypeOf(first), Object.prototype);
  assert.equal(Object.prototype.hasOwnProperty.call(first, "__proto__"), true);
  assert.deepEqual(first.__proto__, ["+", 2, ["*", ["var", "i"], 0.5]]);
  assert.deepEqual(generatedSettingValues(base, step, 2), [3, 1]);
});

test("repeat setting representation stays validation-neutral for unowned deltas", () => {
  const base = { width: 1 };
  const step = { depth: 3 };

  assert.deepEqual(generatedSettingValues(base, step, 4), [1]);
  assert.deepEqual(settingExpressionState(base, step), { width: 1 });
});
