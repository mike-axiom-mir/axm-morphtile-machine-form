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
  assert.match(first.evidence[0].check, /3 blocks \/ 3 requested placements/);
});

test("compose reuses bounded repeat and grid rules without materializing copies", () => {
  const input = request("pattern-compose", {
    name: "direct plus patterns",
    compose: [
      { part: { shape: "plane", pos: [-2, 0, 0] } },
      { repeat: { count: 3, step: [2, 0, 0], part: { shape: "plane" } } },
      { grid: { counts: [2, 2, 1], step: [4, 3, 0], part: { shape: "plane", pos: [0, 4, 0] } } }
    ]
  });

  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  assert.equal(first.candidate.facets.mesh.data.parts.length, 3, "patterns stay compact as three recipe blocks");
  assert.deepEqual(first.candidate.facets.mesh.data.parts[1], {
    repeat: 3,
    as: "i",
    body: [{ shape: "plane", size: [1, 1, 1], pos: [["+", 0, ["*", ["var", "i"], 2]], 0, 0] }]
  });
  assert.deepEqual(first.candidate.facets.mesh.data.parts[2], {
    repeat: 2,
    as: "gx",
    body: [{
      repeat: 2,
      as: "gy",
      body: [{
        shape: "plane",
        size: [1, 1, 1],
        pos: [["+", 0, ["*", ["var", "gx"], 4]], ["+", 4, ["*", ["var", "gy"], 3]], 0]
      }]
    }]
  });
  assert.match(first.evidence[0].check, /3 blocks \/ 8 requested placements/);
});

test("definition-backed pattern blocks preserve runtime-resolution warning", () => {
  const out = run(request("definition-pattern-compose", {
    compose: [
      { part: { shape: "plane" } },
      { repeat: { count: 2, step: [2, 0, 0], instance: { use: "panel", with: { width: 2 } } } }
    ]
  }));

  assert.equal(out.status, "CANDIDATE");
  assert.ok(out.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"));
  assert.match(out.evidence[0].check, /2 blocks \/ 3 requested placements/);
});

test("mixed composition fails closed on malformed, oversized, ambiguous, ignored, and over-budget intent", () => {
  const cases = [
    ["not-array", { compose: {} }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["empty", { compose: [] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["too-many", { compose: Array.from({ length: 65 }, () => ({ part: { shape: "box" } })) }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["bad-item", { compose: [null] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["no-target", { compose: [{}] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["two-targets", { compose: [{ part: { shape: "box" }, instance: { use: "panel" } }] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["two-pattern-targets", { compose: [{ repeat: { count: 2, step: [1, 0, 0], part: { shape: "box" } }, grid: { counts: [2, 1, 1], step: [1, 0, 0], part: { shape: "box" } } }] }, "HOLD_FORM_COMPOSITION_INVALID"],
    ["unknown-item-field", { compose: [{ part: { shape: "box" }, weight: 2 }] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["recursive-compose", { compose: [{ compose: [{ part: { shape: "box" } }] }] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["bad-primitive", { compose: [{ part: { shape: "dragon" } }] }, "HOLD_FORM_VOCABULARY_MISSING"],
    ["bad-instance", { compose: [{ instance: { use: "bad use" } }] }, "HOLD_FORM_DEFINITION_INSTANCE_INVALID"],
    ["bad-repeat", { compose: [{ repeat: { count: 2, step: [0, 0, 0], part: { shape: "box" } } }] }, "HOLD_FORM_REPEAT_INVALID"],
    ["bad-grid", { compose: [{ grid: { counts: [1, 1, 1], step: [0, 0, 0], part: { shape: "box" } } }] }, "HOLD_FORM_GRID_INVALID"],
    ["over-placement-budget", { compose: [
      { repeat: { count: 40, step: [1, 0, 0], part: { shape: "box" } } },
      { grid: { counts: [5, 5, 1], step: [1, 1, 0], part: { shape: "box" } } }
    ] }, "HOLD_FORM_COMPOSITION_INVALID"],
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
      { repeat: { count: 2, step: [2, 0, 0], part: { shape: "plane", pos: [0, 1, 0] } } }
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

integrationTest("current pinned MorphTile runtime compiles direct, repeat, and grid blocks together deterministically", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const out = run(request("runtime-pattern-compose", {
    compose: [
      { part: { shape: "plane", pos: [-2, 0, 0] } },
      { repeat: { count: 3, step: [2, 0, 0], part: { shape: "plane" } } },
      { grid: { counts: [2, 2, 1], step: [4, 3, 0], part: { shape: "plane", pos: [0, 4, 0] } } }
    ]
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const first = MorphTile.compileMesh(tile);
  const second = MorphTile.compileMesh(tile);
  assert.deepEqual(first, second);
  assert.equal(first.hold, null);
  assert.equal(first.recipe_parts, 8);
  assert.equal(first.T.length, 16, "eight planes should compile to sixteen triangles");
  assert.equal(first.P.length, 144, "sixteen triangles should carry 144 position scalars");
});
