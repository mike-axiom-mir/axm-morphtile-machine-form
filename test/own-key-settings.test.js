const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const base = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

function authoredSettings() {
  return JSON.parse('{"__proto__":7,"constructor":8,"toString":9}');
}

function ownProtoSettings(value) {
  return JSON.parse(`{"__proto__":${value}}`);
}

function protoDefinitionWorld() {
  return {
    defs: {
      panel: {
        id: "panel",
        name: "Own-key panel",
        created_by: "test",
        body: {
          facets: {
            mesh: {
              type: "generated",
              source: null,
              data: {
                generator: "recipe",
                vars: ownProtoSettings(1),
                parts: [{ shape: "plane", size: [["var", "__proto__"], 1, 1] }]
              }
            }
          }
        }
      }
    }
  };
}

test("definition-instance settings preserve exact authored own-key identity", () => {
  const input = {
    ...base,
    request_id: "definition-own-key-settings",
    intent: {
      name: "definition own-key settings",
      instances: [{ use: "panel", with: authoredSettings() }]
    }
  };

  const before = JSON.stringify(input);
  const out = run(input);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(input), before, "Form must not mutate caller-owned settings");

  const settings = out.candidate.facets.mesh.data.parts[0].with;
  for (const [key, value] of [["__proto__", 7], ["constructor", 8], ["toString", 9]]) {
    assert.equal(Object.prototype.hasOwnProperty.call(settings, key), true, `${key} must remain an own authored setting`);
    assert.equal(settings[key], value, `${key} must preserve its authored numeric value`);
  }
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("current MorphTile core receives Form-authored __proto__ definition settings as data", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const out = run({
    ...base,
    request_id: "runtime-definition-own-proto-setting",
    intent: {
      name: "runtime own-key definition setting",
      instances: [{ use: "panel", with: ownProtoSettings(2) }]
    }
  });
  assert.equal(out.status, "CANDIDATE");
  const emitted = out.candidate.facets.mesh.data.parts[0].with;
  assert.equal(Object.prototype.hasOwnProperty.call(emitted, "__proto__"), true);
  assert.equal(emitted.__proto__, 2);

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));
  const compiled = MorphTile.compileMesh(tile, protoDefinitionWorld());
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 1);
  assert.ok(compiled.P.length > 0);
  assert.ok(compiled.P.every((value) => Number.isFinite(value)));

  const baseline = run({
    ...base,
    request_id: "runtime-definition-own-proto-setting-baseline",
    intent: {
      name: "runtime own-key definition setting baseline",
      instances: [{ use: "panel", with: ownProtoSettings(1) }]
    }
  });
  const baselineCompiled = MorphTile.compileMesh(MorphTile.createTile(baseline.candidate), protoDefinitionWorld());
  assert.equal(baselineCompiled.hold, null);
  assert.notDeepEqual(compiled.P, baselineCompiled.P, "the authored own-key override must change compiled geometry");
});
