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
        name: "Parametric panel",
        created_by: "test",
        body: {
          facets: {
            mesh: {
              type: "generated",
              source: null,
              data: {
                generator: "recipe",
                vars: { width: 1, depth: 1 },
                parts: [{ shape: "plane", size: [["var", "width"], 1, ["var", "depth"]] }]
              }
            },
            material: { type: "primitive", source: null, data: { color: [0.5, 0.5, 0.5] } }
          }
        }
      }
    }
  };
}

function planeWidthSpans(compiled, count) {
  const scalarsPerPlane = 18;
  return Array.from({ length: count }, (_, index) => {
    const chunk = compiled.P.slice(index * scalarsPerPlane, (index + 1) * scalarsPerPlane);
    const xs = [];
    for (let i = 0; i < chunk.length; i += 3) xs.push(chunk[i]);
    return Math.max(...xs) - Math.min(...xs);
  });
}

test("compiles bounded repeat setting progression without exposing arbitrary expressions", () => {
  const input = request("repeat-setting-progression", {
    name: "progressive panels",
    repeat: {
      count: 3,
      step: [4, 0, 0],
      instance: {
        use: "panel",
        with: { depth: 2, width: 1 }
      },
      with_step: { width: 1 }
    }
  });

  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first.candidate.facets.mesh.data.parts, [{
    repeat: 3,
    as: "i",
    body: [{
      use: "panel",
      with: {
        depth: 2,
        width: ["+", 1, ["*", ["var", "i"], 1]]
      },
      pos: [["+", 0, ["*", ["var", "i"], 4]], 0, 0]
    }]
  }]);
  assert.ok(first.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"));
});

test("repeat setting progression fails closed outside its bounded definition-instance contract", () => {
  const cases = [
    ["primitive-target", {
      repeat: { count: 3, step: [1, 0, 0], part: { shape: "box" }, with_step: { width: 1 } }
    }, "HOLD_FORM_REPEAT_INVALID"],
    ["missing-base", {
      repeat: { count: 3, step: [1, 0, 0], instance: { use: "panel", with: { width: 1 } }, with_step: { depth: 1 } }
    }, "HOLD_FORM_REPEAT_INVALID"],
    ["empty-step", {
      repeat: { count: 3, step: [1, 0, 0], instance: { use: "panel", with: { width: 1 } }, with_step: {} }
    }, "HOLD_FORM_REPEAT_INVALID"],
    ["zero-only", {
      repeat: { count: 3, step: [1, 0, 0], instance: { use: "panel", with: { width: 1 } }, with_step: { width: 0 } }
    }, "HOLD_FORM_REPEAT_INVALID"],
    ["non-finite", {
      repeat: { count: 3, step: [1, 0, 0], instance: { use: "panel", with: { width: 1 } }, with_step: { width: Infinity } }
    }, "HOLD_FORM_INPUT_NONFINITE_VALUE"]
  ];

  for (const [id, intent, expectedCode] of cases) {
    const out = run(request(id, intent));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, expectedCode, id);
  }
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile runtime evaluates repeat setting progression in loop scope", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const out = run(request("runtime-repeat-setting-progression", {
    repeat: {
      count: 3,
      step: [4, 0, 0],
      instance: { use: "panel", with: { width: 1 } },
      with_step: { width: 1 }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const first = MorphTile.compileMesh(tile, definitionWorld());
  const second = MorphTile.compileMesh(tile, definitionWorld());
  assert.deepEqual(first, second);
  assert.equal(first.hold, null);
  assert.equal(first.recipe_parts, 3);
  assert.equal(first.T.length, 6);
  assert.equal(first.P.length, 54);
  assert.deepEqual(planeWidthSpans(first, 3), [1, 2, 3], "definition width must advance by the bounded loop delta");

  const unresolved = MorphTile.compileMesh(tile);
  assert.equal(unresolved.hold, "HOLD_NO_WORLD_TO_LOOK_IN");
});
