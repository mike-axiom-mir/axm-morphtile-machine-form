"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const requestFixture = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...requestFixture, request_id, intent };
}

test("compiles bounded repeat setting progression without exposing arbitrary expressions", () => {
  const input = request("repeat-setting-progression", {
    name: "progressive panels",
    repeat: {
      count: 4,
      step: [4, 0, 0],
      instance: {
        use: "panel",
        with: { width: 1, height: 2 },
        pos: [0, 0, 0]
      },
      with_step: { width: 1 }
    }
  });
  const before = JSON.stringify(input);
  const first = run(input);
  const second = run(input);

  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first.candidate.facets.mesh, {
    type: "generated",
    source: null,
    data: {
      generator: "recipe",
      vars: {},
      parts: [{
        repeat: 4,
        as: "i",
        body: [{
          use: "panel",
          with: {
            width: ["+", 1, ["*", ["var", "i"], 1]],
            height: 2
          },
          pos: [["+", 0, ["*", ["var", "i"], 4]], 0, 0]
        }]
      }]
    }
  });
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

integrationTest("pinned MorphTile runtime evaluates repeat setting progression in loop scope", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  delete require.cache[require.resolve(runtimePath)];
  const MorphTile = require(runtimePath);

  const world = MorphTile.createWorld();
  MorphTile.applyOp(world, {
    op: "definition.put",
    definition: {
      id: "panel",
      name: "Panel",
      body: {
        schema: "morphtile.tile-spec/v0.4",
        name: "Panel body",
        form_hints: ["game_asset"],
        facets: {
          mesh: {
            type: "generated",
            source: null,
            data: {
              generator: "recipe",
              vars: {},
              parts: [{ shape: "plane", size: [["var", "width"], ["var", "height"], 1] }]
            }
          }
        }
      },
      parameters: {
        width: { kind: "number", default: 1, target: "facets.mesh.data.vars.width" },
        height: { kind: "number", default: 2, target: "facets.mesh.data.vars.height" }
      }
    }
  });

  const out = run(request("repeat-setting-runtime", {
    repeat: {
      count: 3,
      step: [4, 0, 0],
      instance: { use: "panel", with: { width: 1, height: 2 } },
      with_step: { width: 1 }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validation = MorphTile.validateTile(tile, world);
  assert.equal(validation.ok, true, JSON.stringify(validation));
  const first = MorphTile.compileMeshData(tile, {}, world);
  const second = MorphTile.compileMeshData(tile, {}, world);
  assert.deepEqual(first, second);
  assert.equal(first.hold, null);
  assert.equal(first.receipt.recipe_parts, 3);
  assert.equal(first.P.length, 54);
  assert.equal(first.T.length, 18);

  const widths = [];
  for (let offset = 0; offset < first.P.length; offset += 18) {
    const xs = [];
    for (let i = offset; i < offset + 18; i += 3) xs.push(first.P[i]);
    widths.push(Math.max(...xs) - Math.min(...xs));
  }
  assert.deepEqual(widths, [1, 2, 3]);
});
