const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const base = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

function definitionWorld() {
  return {
    defs: {
      panel: {
        id: "panel",
        name: "Mixed composition panel",
        created_by: "test",
        body: {
          facets: {
            mesh: {
              type: "generated",
              source: null,
              data: {
                generator: "recipe",
                vars: { width: 1 },
                parts: [{ shape: "plane", size: [["var", "width"], 1, 1] }]
              }
            }
          }
        }
      }
    }
  };
}

test("normalizes ordered primitive and definition items into one bounded recipe", () => {
  const input = request("mixed-composition", {
    name: "mixed form",
    compose: [
      { part: { shape: "box", size: [3, 0.25, 1], pos: [0, 0, 0] } },
      { instance: { use: "panel", with: { width: 2 }, pos: [0, 1, 0], scale: 1.5 } },
      { part: { shape: "sphere", size: [0.5, 0.5, 0.5], pos: [2, 1, 0], segments: 12 } }
    ]
  });

  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
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
        { shape: "box", size: [3, 0.25, 1], pos: [0, 0, 0] },
        { use: "panel", with: { width: 2 }, pos: [0, 1, 0], scale: 1.5 },
        { shape: "sphere", size: [0.5, 0.5, 0.5], pos: [2, 1, 0], segments: 12 }
      ]
    }
  });
  assert.ok(first.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"));
  assert.match(first.evidence[0].check, /3 parts/);
});

test("mixed composition fails closed on malformed, oversized, ambiguous, and ignored intent", () => {
  const cases = [
    ["not-array", { compose: {} }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["empty", { compose: [] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["too-many", { compose: Array.from({ length: 65 }, () => ({ part: { shape: "box" } })) }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["bad-item", { compose: [null] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["no-target", { compose: [{}] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["two-targets", { compose: [{ part: { shape: "box" }, instance: { use: "panel" } }] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["unknown-item-field", { compose: [{ part: { shape: "box" }, weight: 2 }] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["bad-primitive", { compose: [{ part: { shape: "dragon" } }] }, "HOLD_FORM_VOCABULARY_MISSING"],
    ["bad-instance", { compose: [{ instance: { use: "bad use" } }] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["nested-primitive-field", { compose: [{ part: { shape: "box", color: [1, 0, 0] } }] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["nested-instance-field", { compose: [{ instance: { use: "panel", color: [1, 0, 0] } }] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["top-level-ignored", { compose: [{ part: { shape: "box" } }], vars: { n: 2 } }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["top-level-ambiguous", { compose: [{ part: { shape: "box" } }], parts: [{ shape: "box" }] }, "HOLD_FORM_COMPOSITION_AMBIGUOUS"]
  ];

  for (const [id, intent, code] of cases) {
    const out = run(request(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, code, id);
  }
});

test("a primitive-only compose still emits no definition-resolution warning", () => {
  const out = run(request("primitive-only-compose", {
    compose: [
      { part: { shape: "box" } },
      { part: { shape: "plane", pos: [0, 1, 0] } }
    ]
  }));
  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"), false);
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("current pinned MorphTile runtime compiles mixed primitive and definition matter deterministically", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const out = run(request("runtime-mixed-composition", {
    compose: [
      { part: { shape: "plane", size: [2, 1, 1], pos: [0, 0, 0] } },
      { instance: { use: "panel", with: { width: 3 }, pos: [3, 0, 0] } }
    ]
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const world = definitionWorld();
  const first = MorphTile.compileMesh(tile, world);
  const second = MorphTile.compileMesh(tile, world);
  assert.deepEqual(first, second);
  assert.equal(first.hold, null);
  assert.equal(first.recipe_parts, 2);
  assert.equal(first.T.length, 4, "two planes should compile to four triangles");
  assert.equal(first.P.length, 36, "four triangles should carry 36 position scalars");

  const unresolved = MorphTile.compileMesh(tile);
  assert.equal(unresolved.hold, "HOLD_NO_WORLD_TO_LOOK_IN");
});
