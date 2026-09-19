const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("../fixtures/request.box.json");
const { run } = require("../src");

test("builds candidate form data without mutating the request", () => {
  const before = JSON.stringify(request), first = run(request), second = run(request);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(first.candidate.facets.mesh.data.shape, "box");
  assert.equal(JSON.stringify(request), before);
});

test("holds an unsupported named form instead of fabricating it", () => {
  const held = run({ ...request, request_id: "form-held", intent: { shape: "dragon" } });
  assert.equal(held.status, "HOLD");
  assert.equal(held.candidate, null);
});
