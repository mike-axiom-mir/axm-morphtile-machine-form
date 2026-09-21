const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const base = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

function leafOf(out) {
  let node = out.candidate.facets.mesh.data.parts[0];
  while (node && Number.isInteger(node.repeat) && Array.isArray(node.body)) node = node.body[0];
  return node;
}

function definitionWorld() {
  return {
    defs: {
      panel: {
        id: "panel",
        name: "Parametric panel",
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
            }
          }
        }
      }
    }
  };
}

test("definition grid may progress named settings independently across stationary axes", () => {
  const input = request("grid-setting-xy", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      with_step: {
        x: { width: 1 },
        y: { depth: 0.5 }
      },
      instance: { use: "panel", with: { width: 1, depth: 2 }, pos: [3, -1, 4] }
    }
  });
  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  const leaf = leafOf(first);
  assert.deepEqual(leaf.pos, [3, -1, 4]);
  assert.deepEqual(leaf.with, {
    depth: ["+", 2, ["*", ["var", "gy"], 0.5]],
    width: ["+", 1, ["*", ["var", "gx"], 1]]
  });
});

test("grid setting progression preserves exact authored own-key identity", () => {
  const baseSettings = JSON.parse('{"__proto__":2,"constructor":3,"toString":4}');
  const xStep = JSON.parse('{"__proto__":0.5,"constructor":1,"toString":-0.25}');
  const input = request("grid-setting-own-keys", {
    grid: {
      counts: [2, 1, 1],
      step: [0, 0, 0],
      with_step: { x: xStep },
      instance: { use: "panel", with: baseSettings }
    }
  });
  const before = JSON.stringify(input);
  const out = run(input);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(input), before, "grid progression must not mutate caller-owned own-key settings");

  const emitted = leafOf(out).with;
  const expected = [
    ["__proto__", ["+", 2, ["*", ["var", "gx"], 0.5]]],
    ["constructor", ["+", 3, ["*", ["var", "gx"], 1]]],
    ["toString", ["+", 4, ["*", ["var", "gx"], -0.25]]]
  ];
  for (const [key, value] of expected) {
    assert.equal(Object.prototype.hasOwnProperty.call(emitted, key), true, `${key} must remain an own setting`);
    assert.deepEqual(emitted[key], value, `${key} must retain its authored progression expression`);
  }
});

test("grid setting progression composes with rotation and definition scale progression", () => {
  const out = run(request("grid-setting-compose-state", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      with_step: { x: { width: 0.5 }, y: { depth: 0.25 } },
      scale_step: { x: 0.1 },
      rot_step: { y: [0, 0.2, 0] },
      instance: { use: "panel", with: { width: 1, depth: 1 }, scale: 1 }
    }
  }));
  assert.equal(out.status, "CANDIDATE");
  const leaf = leafOf(out);
  assert.deepEqual(leaf.pos, [0, 0, 0]);
  assert.deepEqual(leaf.with.width, ["+", 1, ["*", ["var", "gx"], 0.5]]);
  assert.deepEqual(leaf.with.depth, ["+", 1, ["*", ["var", "gy"], 0.25]]);
  assert.deepEqual(leaf.scale, ["+", 1, ["*", ["var", "gx"], 0.1]]);
  assert.deepEqual(leaf.rot, [0, ["+", 0, ["*", ["var", "gy"], 0.2]], 0]);
});

test("compose reuses the bounded grid setting progression rule", () => {
  const out = run(request("compose-grid-settings", {
    compose: [{ grid: {
      counts: [1, 2, 1],
      step: [0, 0, 0],
      with_step: { y: { width: 0.5 } },
      instance: { use: "panel", with: { width: 1 } }
    } }]
  }));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(leafOf(out).with.width, ["+", 1, ["*", ["var", "gy"], 0.5]]);
});

test("grid setting progression fails closed outside its bounded definition contract", () => {
  const cases = [
    ["primitive", { counts: [2,1,1], step: [1,0,0], with_step: { x: { width: 1 } }, part: { shape: "box" } }],
    ["empty", { counts: [2,1,1], step: [1,0,0], with_step: {}, instance: { use: "panel", with: { width: 1 } } }],
    ["unknown-axis", { counts: [2,1,1], step: [1,0,0], with_step: { q: { width: 1 } }, instance: { use: "panel", with: { width: 1 } } }],
    ["missing-base", { counts: [2,1,1], step: [1,0,0], with_step: { x: { depth: 1 } }, instance: { use: "panel", with: { width: 1 } } }],
    ["zero-only", { counts: [2,1,1], step: [1,0,0], with_step: { x: { width: 0 } }, instance: { use: "panel", with: { width: 1 } } }],
    ["inactive-axis", { counts: [1,2,1], step: [0,1,0], with_step: { x: { width: 1 } }, instance: { use: "panel", with: { width: 1 } } }],
    ["collision", { counts: [2,3,1], step: [0,0,0], with_step: { x: { width: 1 }, y: { width: -0.5 } }, instance: { use: "panel", with: { width: 5 } } }],
    ["overflow", { counts: [3,1,1], step: [0,0,0], with_step: { x: { width: Number.MAX_VALUE } }, instance: { use: "panel", with: { width: Number.MAX_VALUE } } }]
  ];
  for (const [id, grid] of cases) {
    const out = run(request(`grid-setting-${id}`, { grid }));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
  }
});

test("each active grid axis still needs its own translation, rotation, scale, or setting progression", () => {
  const out = run(request("grid-setting-axis-distinctness", {
    grid: {
      counts: [2, 2, 1],
      step: [1, 0, 0],
      with_step: { x: { width: 1 } },
      instance: { use: "panel", with: { width: 1 } }
    }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID");
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile consumes multi-axis definition grid setting expressions", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const out = run(request("runtime-grid-settings", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      with_step: { x: { width: 1 }, y: { depth: 0.5 } },
      rot_step: { y: [0, 0.1, 0] },
      instance: { use: "panel", with: { width: 1, depth: 1 } }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const world = definitionWorld();
  const tile = MorphTile.createTile(out.candidate);
  world.tiles = { [tile.id]: tile };
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));
  const compiled = MorphTile.compileMesh(tile, world);
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 4);
  assert.ok(compiled.P.length > 0);
  assert.ok(compiled.P.every(Number.isFinite));

  const fixedCandidate = JSON.parse(JSON.stringify(out.candidate));
  const fixedLeaf = (() => {
    let node = fixedCandidate.facets.mesh.data.parts[0];
    while (node && Number.isInteger(node.repeat) && Array.isArray(node.body)) node = node.body[0];
    return node;
  })();
  fixedLeaf.with = { width: 1, depth: 1 };
  const fixedTile = MorphTile.createTile(fixedCandidate);
  world.tiles[fixedTile.id] = fixedTile;
  const fixedCompiled = MorphTile.compileMesh(fixedTile, world);
  assert.equal(fixedCompiled.hold, null);
  assert.notDeepEqual(compiled.P, fixedCompiled.P, "receiver must consume emitted per-cell setting expressions");
});
