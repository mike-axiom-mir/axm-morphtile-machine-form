const test = require("node:test");
const assert = require("node:assert/strict");

const {
  INDEX_VAR,
  linearValue,
  linearExpression,
  proveFiniteRepeat
} = require("../src/repeat-progression");

test("shared repeat progression kernel owns stable linear arithmetic", () => {
  assert.equal(INDEX_VAR, "i");
  assert.equal(linearValue(2, 3, 0.5), 3.5);
  assert.deepEqual(linearExpression(2, 0.5), ["+", 2, ["*", ["var", "i"], 0.5]]);
  assert.equal(linearExpression(2, 0), 2);
});

test("shared repeat progression proof reports finite, domain, and overflow boundaries", () => {
  assert.deepEqual(
    proveFiniteRepeat(3, (index) => [linearValue(2, index, 0.5)]),
    { ok: true }
  );

  const domain = proveFiniteRepeat(
    3,
    (index) => [linearValue(1, index, -1)],
    (state) => state[0] <= 0 ? { value: state[0] } : null
  );
  assert.deepEqual(domain, { ok: false, reason: "domain", index: 1, detail: { value: 0 } });

  const overflow = proveFiniteRepeat(3, (index) => [linearValue(Number.MAX_VALUE, index, Number.MAX_VALUE)]);
  assert.deepEqual(overflow, { ok: false, reason: "nonfinite", index: 1 });
});
