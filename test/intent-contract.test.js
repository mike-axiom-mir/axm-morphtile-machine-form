const test = require("node:test");
const assert = require("node:assert/strict");
const base = require("../fixtures/request.box.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

test("malformed form intent holds as malformed instead of being misreported as a missing shape", () => {
  for (const [id, intent] of [["null-intent", null], ["array-intent", []], ["string-intent", "box"]]) {
    const out = run(request(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, "HOLD_FORM_INTENT_INVALID", id);
  }
});

test("every bounded intent mode fails closed on fields it would otherwise ignore", () => {
  const cases = [
    ["primitive-color", { name: "box", shape: "box", color: [1, 0, 0] }, "color"],
    ["parts-vars", { name: "parts", parts: [{ shape: "box" }], vars: { n: 2 } }, "vars"],
    ["repeat-vars", { name: "repeat", repeat: { count: 2, step: [1, 0, 0], part: { shape: "box" } }, vars: { n: 2 } }, "vars"],
    ["recipe-extra", { name: "recipe", recipe: [{ shape: "box" }], vars: {}, quality: "high" }, "quality"]
  ];

  for (const [id, intent, field] of cases) {
    const out = run(request(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, "HOLD_FORM_PARAMETER_UNKNOWN", id);
    assert.match(out.holds[0].detail, new RegExp(field), id);
  }
});

test("known mode fields remain deterministic and the broad recipe lane states its runtime-validation boundary", () => {
  const primitive = run(request("primitive-known", { name: "known box", shape: "box", size: [2, 3, 4] }));
  assert.equal(primitive.status, "CANDIDATE");
  assert.deepEqual(primitive.candidate.facets.mesh.data, { shape: "box", size: [2, 3, 4] });

  const recipe = run(request("recipe-known", {
    name: "known recipe",
    recipe: [{ shape: "box", pos: [0, 0, 0] }],
    vars: { n: 1 }
  }));
  assert.equal(recipe.status, "CANDIDATE");
  assert.ok(recipe.warnings.some((warning) => warning.code === "CALLER_RECIPE_RUNTIME_VALIDATION_REQUIRED"));
});

test("repeat errors name repeat.part rather than pretending it was a flat parts index", () => {
  const out = run(request("repeat-part-label", {
    repeat: { count: 2, step: [1, 0, 0], part: { shape: "box", color: [1, 0, 0] } }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_PARAMETER_UNKNOWN");
  assert.match(out.holds[0].detail, /repeat\.part/);
});
