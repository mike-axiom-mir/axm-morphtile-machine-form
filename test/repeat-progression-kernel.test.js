const test = require("node:test");
const assert = require("node:assert/strict");

const {
  INDEX_VAR,
  linearValue,
  linearExpression,
  proveFiniteRepeat,
  proveFiniteDistinctRepeat
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

test("shared repeat progression kernel proves complete generated-state distinctness", () => {
  assert.deepEqual(
    proveFiniteDistinctRepeat(3, (index) => [index, index * 2]),
    { ok: true }
  );

  const collapsed = proveFiniteDistinctRepeat(
    2,
    (index) => [linearValue(Number.MAX_SAFE_INTEGER + 1, index, 1)]
  );
  assert.deepEqual(collapsed, { ok: false, reason: "duplicate", index: 1 });

  const combined = proveFiniteDistinctRepeat(
    2,
    (index) => [
      linearValue(Number.MAX_SAFE_INTEGER + 1, index, 1),
      linearValue(0, index, 1)
    ]
  );
  assert.deepEqual(combined, { ok: true });
});
