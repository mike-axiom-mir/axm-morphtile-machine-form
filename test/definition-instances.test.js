const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const base = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

test("normalizes bounded definition instances deterministically without resolving foreign definitions", () => {
  const input = request("definition-instances", {
    name: "definition instances",
    instances: [
      {
        use: "beam.v1",
        with: { width: 2, length: 4 },
        pos: [0, 1, 0],
        scale: 1.5
      },
      {
        use: "beam.v1",
        rot: [0, 0.5, 0],
        scale: [1, 2, 1]
      }
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
        {
          use: "beam.v1",
          with: { length: 4, width: 2 },
          pos: [0, 1, 0],
          scale: 1.5
        },
        {
          use: "beam.v1",
          rot: [0, 0.5, 0],
          scale: [1, 2, 1]
        }
      ]
    }
  });
  assert.ok(first.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"));
});

test("definition-instance vocabulary fails closed on ambiguity, malformed references, settings and transforms", () => {
  const cases = [
    ["ambiguous", { parts: [{ shape: "box" }], instances: [{ use: "beam" }] }, "HOLD_FORM_COMPOSITION_AMBIGUOUS"],
    ["empty", { instances: [] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["too-many", { instances: Array.from({ length: 65 }, () => ({ use: "beam" })) }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["bad-use", { instances: [{ use: "bad use" }] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["unknown-field", { instances: [{ use: "beam", color: [1, 0, 0] }] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["bad-with", { instances: [{ use: "beam", with: { width: "wide" } }] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["bad-setting-name", { instances: [{ use: "beam", with: { "bad setting": 2 } }] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["too-many-settings", { instances: [{ use: "beam", with: Object.fromEntries(Array.from({ length: 33 }, (_, i) => [`p${i}`, i])) }] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["zero-scale", { instances: [{ use: "beam", scale: 0 }] }, "HOLD_FORM_PARAMETER_INVALID"],
    ["bad-scale-vector", { instances: [{ use: "beam", scale: [1, -1, 1] }] }, "HOLD_FORM_PARAMETER_INVALID"],
    ["bad-position", { instances: [{ use: "beam", pos: [0, 1] }] }, "HOLD_FORM_PARAMETER_INVALID"]
  ];

  for (const [id, intent, code] of cases) {
    const out = run(request(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, code, id);
  }
});

test("instances mode rejects top-level fields it would otherwise ignore", () => {
  const out = run(request("instances-top-level-extra", {
    name: "instances",
    instances: [{ use: "beam" }],
    vars: { width: 2 }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_PARAMETER_UNKNOWN");
  assert.match(out.holds[0].detail, /vars/);
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("current pinned MorphTile runtime resolves bounded definition instances with exact receipts", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const out = run(request("runtime-definition-instances", {
    name: "runtime definition instances",
    instances: [
      { use: "panel", with: { width: 2 }, pos: [0, 0, 0] },
      { use: "panel", with: { width: 3 }, pos: [4, 0, 0] }
    ]
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const world = {
    defs: {
      panel: {
        id: "panel",
        name: "Parametric panel",
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
            },
            material: { type: "primitive", source: null, data: { color: [0.5, 0.5, 0.5] } }
          }
        }
      }
    }
  };

  const first = MorphTile.compileMesh(tile, world);
  const second = MorphTile.compileMesh(tile, world);
  assert.deepEqual(first, second);
  assert.equal(first.hold, null);
  assert.equal(first.recipe_parts, 2);
  assert.equal(first.T.length, 4, "two reused planes should compile to four triangles");
  assert.equal(first.P.length, 36, "four triangles should carry 36 position scalars");

  const unresolved = MorphTile.compileMesh(tile);
  assert.equal(unresolved.hold, "HOLD_NO_WORLD_TO_LOOK_IN");
});
