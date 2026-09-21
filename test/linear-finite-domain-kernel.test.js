const test = require("node:test");
const assert = require("node:assert/strict");

const { proveFiniteLinear } = require("../src/repeat-progression");

test("shared linear finite-domain proof accepts bounded finite progression", () => {
  assert.equal(typeof proveFiniteLinear, "function");
  assert.deepEqual(proveFiniteLinear(4, 10, 0.5), { ok: true });
});

test("shared linear finite-domain proof reports the first generated overflow", () => {
  assert.equal(typeof proveFiniteLinear, "function");
  assert.deepEqual(
    proveFiniteLinear(2, Number.MAX_VALUE, Number.MAX_VALUE),
    { ok: false, reason: "nonfinite", index: 1 }
  );
});

test("shared linear finite-domain proof preserves target-specific domain detail", () => {
  assert.deepEqual(
    proveFiniteLinear(4, 2, -1, (value) => value <= 0 ? { value } : null),
    { ok: false, reason: "domain", index: 2, detail: { value: 0 } }
  );
});
