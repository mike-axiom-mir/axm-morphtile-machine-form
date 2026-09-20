const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("../fixtures/request.box.json");
const { run } = require("../src");

const primitiveShapes = ["box", "sphere", "cylinder", "cone", "wedge", "plane"];

function withIntent(request_id, intent) {
  return { ...request, request_id, intent };
}

test("builds candidate form data without mutating the request", () => {
  const before = JSON.stringify(request), first = run(request), second = run(request);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(first.machine.version, "0.3.0");
  assert.equal(first.candidate.facets.mesh.data.shape, "box");
  assert.equal(JSON.stringify(request), before);
});

test("maps every explicit MorphTile primitive name deterministically", () => {
  for (const shape of primitiveShapes) {
    const input = withIntent(`primitive-${shape}`, { shape, name: `${shape} proof`, size: [2, 3, 4] });
    const before = JSON.stringify(input);
    const first = run(input), second = run(input);
    assert.equal(first.status, "CANDIDATE", shape);
    assert.deepEqual(first, second, shape);
    assert.deepEqual(first.candidate.facets.mesh, {
      type: "primitive",
      source: null,
      data: { shape, size: [2, 3, 4] }
    });
    assert.equal(JSON.stringify(input), before, shape);
  }
});

test("preserves bounded primitive-local geometry parameters", () => {
  const cylinder = run(withIntent("cylinder-params", {
    shape: "cylinder",
    size: [2, 5, 2],
    pos: [1, 2, 3],
    rot: [0, 0.5, 0],
    segments: 24,
    taper: 0.7
  }));
  assert.equal(cylinder.status, "CANDIDATE");
  assert.deepEqual(cylinder.candidate.facets.mesh.data, {
    shape: "cylinder",
    size: [2, 5, 2],
    pos: [1, 2, 3],
    rot: [0, 0.5, 0],
    segments: 24,
    taper: 0.7
  });

  const box = run(withIntent("box-sub", { shape: "box", size: [1, 1, 1], sub: 5 }));
  assert.equal(box.status, "CANDIDATE");
  assert.equal(box.candidate.facets.mesh.data.sub, 5);
});

test("holds invalid primitive parameters instead of emitting malformed matter", () => {
  for (const [id, intent] of [
    ["bad-size", { shape: "box", size: [1, 0, 1] }],
    ["bad-segments", { shape: "sphere", segments: 2 }],
    ["wrong-segments", { shape: "wedge", segments: 8 }],
    ["bad-taper", { shape: "cylinder", taper: 0 }],
    ["wrong-taper", { shape: "cone", taper: 0.5 }],
    ["wrong-sub", { shape: "plane", sub: 2 }]
  ]) {
    const held = run(withIntent(id, intent));
    assert.equal(held.status, "HOLD", id);
    assert.equal(held.candidate, null, id);
    assert.equal(held.holds[0].code, "HOLD_FORM_PARAMETER_INVALID", id);
  }
});

test("holds an unsupported named form instead of fabricating it", () => {
  const held = run(withIntent("form-held", { shape: "dragon" }));
  assert.equal(held.status, "HOLD");
  assert.equal(held.candidate, null);
  assert.equal(held.holds[0].code, "HOLD_FORM_VOCABULARY_MISSING");
  assert.equal(held.suggested_missing_capability, "form:dragon");
});

test("keeps caller-supplied recipes on the existing generated-mesh path", () => {
  const recipe = [{ shape: "box", size: [1, 2, 3] }, { shape: "sphere", pos: [0, 2, 0] }];
  const out = run(withIntent("recipe-proof", { name: "recipe proof", recipe, vars: { scale: 2 } }));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.facets.mesh, {
    type: "generated",
    source: null,
    data: { generator: "recipe", vars: { scale: 2 }, parts: recipe }
  });
});

test("normalizes a flat primitive composition deterministically without mutating input", () => {
  const input = withIntent("parts-proof", {
    name: "parts proof",
    parts: [
      { shape: "box", size: [3, 0.3, 0.6], pos: [0, 1.5, 0] },
      { shape: "cylinder", size: [0.45, 1.5, 0.45], pos: [-1.1, 0.75, 0], segments: 12 },
      { shape: "sphere", size: [0.7, 0.7, 0.7], pos: [1.1, 1.5, 0], segments: 12 }
    ]
  });
  const before = JSON.stringify(input), first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first.candidate.facets.mesh, {
    type: "generated",
    source: null,
    data: {
      generator: "recipe",
      vars: {},
      parts: [
        { shape: "box", size: [3, 0.3, 0.6], pos: [0, 1.5, 0] },
        { shape: "cylinder", size: [0.45, 1.5, 0.45], pos: [-1.1, 0.75, 0], segments: 12 },
        { shape: "sphere", size: [0.7, 0.7, 0.7], pos: [1.1, 1.5, 0], segments: 12 }
      ]
    }
  });
});

test("fails closed on ambiguous, oversized, unsupported, or unknown-field compositions", () => {
  const cases = [
    ["ambiguous", { parts: [{ shape: "box" }], recipe: [{ shape: "box" }] }, "HOLD_FORM_COMPOSITION_AMBIGUOUS"],
    ["empty", { parts: [] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["too-many", { parts: Array.from({ length: 65 }, () => ({ shape: "box" })) }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["bad-shape", { parts: [{ shape: "dragon" }] }, "HOLD_FORM_VOCABULARY_MISSING"],
    ["unknown-field", { parts: [{ shape: "box", color: [1, 0, 0] }] }, "HOLD_FORM_PARAMETER_UNKNOWN"]
  ];

  for (const [id, intent, code] of cases) {
    const out = run(withIntent(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, code, id);
  }
});
