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
        name: "Grid panel",
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

test("normalizes a bounded primitive grid into compact nested MorphTile loops", () => {
  const input = request("primitive-grid", {
    name: "panel grid",
    grid: {
      counts: [2, 3, 1],
      step: [2, 3, 0],
      part: { shape: "plane", size: [1, 1, 1], pos: [1, 2, 3] }
    }
  });

  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first.candidate.facets.mesh.data.parts, [{
    repeat: 2,
    as: "gx",
    body: [{
      repeat: 3,
      as: "gy",
      body: [{
        shape: "plane",
        size: [1, 1, 1],
        pos: [
          ["+", 1, ["*", ["var", "gx"], 2]],
          ["+", 2, ["*", ["var", "gy"], 3]],
          3
        ]
      }]
    }]
  }]);
  assert.match(first.evidence[0].check, /6 instances/);
});

test("normalizes a bounded definition-instance grid without resolving the definition body", () => {
  const out = run(request("definition-grid", {
    grid: {
      counts: [2, 1, 2],
      step: [4, 0, -2],
      instance: { use: "panel", with: { width: 2 }, pos: [1, 0, 3], scale: 1.25 }
    }
  }));

  assert.equal(out.status, "CANDIDATE");
  assert.ok(out.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"));
  assert.deepEqual(out.candidate.facets.mesh.data.parts, [{
    repeat: 2,
    as: "gx",
    body: [{
      repeat: 2,
      as: "gz",
      body: [{
        use: "panel",
        with: { width: 2 },
        pos: [
          ["+", 1, ["*", ["var", "gx"], 4]],
          0,
          ["+", 3, ["*", ["var", "gz"], -2]]
        ],
        scale: 1.25
      }]
    }]
  }]);
});

test("grid vocabulary fails closed on duplicate, oversized, ambiguous, malformed, and ignored intent", () => {
  const cases = [
    ["not-object", { grid: [] }, "HOLD_FORM_GRID_INVALID"],
    ["bad-counts-shape", { grid: { counts: [2, 2], step: [1, 1, 0], part: { shape: "box" } } }, "HOLD_FORM_GRID_INVALID"],
    ["bad-count", { grid: { counts: [2, 0, 1], step: [1, 1, 0], part: { shape: "box" } } }, "HOLD_FORM_GRID_INVALID"],
    ["one-cell", { grid: { counts: [1, 1, 1], step: [0, 0, 0], part: { shape: "box" } } }, "HOLD_FORM_GRID_INVALID"],
    ["over-budget", { grid: { counts: [9, 8, 1], step: [1, 1, 0], part: { shape: "box" } } }, "HOLD_FORM_GRID_INVALID"],
    ["missing-step", { grid: { counts: [2, 1, 1], part: { shape: "box" } } }, "HOLD_FORM_GRID_INVALID"],
    ["zero-active-step", { grid: { counts: [2, 1, 1], step: [0, 0, 0], part: { shape: "box" } } }, "HOLD_FORM_GRID_INVALID"],
    ["no-target", { grid: { counts: [2, 1, 1], step: [1, 0, 0] } }, "HOLD_FORM_GRID_INVALID"],
    ["two-targets", { grid: { counts: [2, 1, 1], step: [1, 0, 0], part: { shape: "box" }, instance: { use: "panel" } } }, "HOLD_FORM_GRID_INVALID"],
    ["unknown-grid-field", { grid: { counts: [2, 1, 1], step: [1, 0, 0], part: { shape: "box" }, diagonal: true } }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["unknown-target-field", { grid: { counts: [2, 1, 1], step: [1, 0, 0], part: { shape: "box", color: [1, 0, 0] } } }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["ambiguous-top-level", { grid: { counts: [2, 1, 1], step: [1, 0, 0], part: { shape: "box" } }, repeat: { count: 2, step: [1, 0, 0], part: { shape: "box" } } }, "HOLD_FORM_COMPOSITION_AMBIGUOUS"],
    ["ignored-top-level", { grid: { counts: [2, 1, 1], step: [1, 0, 0], part: { shape: "box" } }, vars: { n: 2 } }, "HOLD_FORM_PARAMETER_UNKNOWN"]
  ];

  for (const [id, intent, code] of cases) {
    const out = run(request(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, code, id);
  }
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("current pinned MorphTile runtime compiles a six-cell primitive grid deterministically", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const out = run(request("runtime-primitive-grid", {
    grid: {
      counts: [2, 3, 1],
      step: [2, 3, 0],
      part: { shape: "plane", size: [1, 1, 1] }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const first = MorphTile.compileMesh(tile);
  const second = MorphTile.compileMesh(tile);
  assert.deepEqual(first, second);
  assert.equal(first.hold, null);
  assert.equal(first.recipe_parts, 6);
  assert.equal(first.T.length, 12, "six planes should compile to twelve triangles");
  assert.equal(first.P.length, 108, "twelve triangles should carry 108 position scalars");
});

integrationTest("current pinned MorphTile runtime resolves a four-cell definition grid", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const out = run(request("runtime-definition-grid", {
    grid: {
      counts: [2, 1, 2],
      step: [3, 0, 4],
      instance: { use: "panel", with: { width: 2 } }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const compiled = MorphTile.compileMesh(tile, definitionWorld());
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 4);
  assert.equal(compiled.T.length, 8, "four reused planes should compile to eight triangles");
  assert.equal(compiled.P.length, 72, "eight triangles should carry 72 position scalars");

  const unresolved = MorphTile.compileMesh(tile);
  assert.equal(unresolved.hold, "HOLD_NO_WORLD_TO_LOOK_IN");
});
