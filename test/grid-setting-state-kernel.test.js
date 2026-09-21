const test = require("node:test");
const assert = require("node:assert/strict");

const {
  generatedSettingValues,
  settingExpressionState
} = require("../src/grid-setting-state");

test("grid setting state keeps canonical key order across generated values and expressions", () => {
  const base = Object.create(null);
  base.width = 1;
  base.depth = 10;
  const deltas = [Object.assign(Object.create(null), { width: 2 }), Object.assign(Object.create(null), { depth: 0.5 }), Object.assign(Object.create(null), { width: -1 })];

  const baseBefore = JSON.stringify(base);
  const deltasBefore = JSON.stringify(deltas);

  assert.deepEqual(generatedSettingValues(base, deltas, [2, 1, 3]), [10.5, 2]);
  assert.deepEqual(settingExpressionState(base, deltas), {
    depth: ["+", 10, ["*", ["var", "gy"], 0.5]],
    width: ["+", ["+", 1, ["*", ["var", "gx"], 2]], ["*", ["var", "gz"], -1]]
  });
  assert.equal(JSON.stringify(base), baseBefore);
  assert.equal(JSON.stringify(deltas), deltasBefore);
});

test("grid setting state preserves own __proto__ settings without changing object prototype", () => {
  const base = JSON.parse('{"__proto__":2,"width":1}');
  const x = JSON.parse('{"__proto__":0.5}');
  const deltas = [x, null, null];

  const first = settingExpressionState(base, deltas);
  const second = settingExpressionState(base, deltas);

  assert.deepEqual(first, second);
  assert.equal(Object.getPrototypeOf(first), Object.prototype);
  assert.equal(Object.prototype.hasOwnProperty.call(first, "__proto__"), true);
  assert.deepEqual(first.__proto__, ["+", 2, ["*", ["var", "gx"], 0.5]]);
  assert.deepEqual(generatedSettingValues(base, deltas, [2, 0, 0]), [3, 1]);
});

test("grid setting representation stays validation-neutral for unowned deltas", () => {
  const base = { width: 1 };
  const deltas = [Object.assign(Object.create(null), { depth: 3 }), null, null];

  assert.deepEqual(generatedSettingValues(base, deltas, [4, 0, 0]), [1]);
  assert.deepEqual(settingExpressionState(base, deltas), { width: 1 });
});
