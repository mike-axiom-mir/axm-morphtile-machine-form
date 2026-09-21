const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const baseRequest = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

function request(request_id, intent) {
  return { ...baseRequest, request_id, intent };
}

function leafOf(out) {
  let node = out.candidate.facets.mesh.data.parts[0];
  while (node && Number.isInteger(node.repeat) && Array.isArray(node.body)) node = node.body[0];
  return node;
}

test("definition grid may change scalar scale along a stationary active axis", () => {
  const input = request("grid-scale-x", {
    grid: {
      counts: [3, 1, 1],
      step: [0, 0, 0],
      scale_step: { x: 0.25 },
      instance: { use: "panel", scale: 0.5, pos: [4, -2, 1] }
    }
  });
  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
  const leaf = leafOf(first);
  assert.deepEqual(leaf.pos, [4, -2, 1]);
  assert.deepEqual(leaf.scale, ["+", 0.5, ["*", ["var", "gx"], 0.25]]);
});

test("vector grid scale progression composes across axes with rotation", () => {
  const out = run(request("grid-vector-scale-rot", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      scale_step: {
        x: [0.2, 0, 0],
        y: [0, 0.15, -0.1]
      },
      rot_step: { y: [0, 0.1, 0] },
      instance: { use: "panel", scale: [0.5, 1, 1.2], rot: [0, 0.2, 0] }
    }
  }));
  assert.equal(out.status, "CANDIDATE");
  const leaf = leafOf(out);
  assert.deepEqual(leaf.pos, [0, 0, 0]);
  assert.deepEqual(leaf.scale, [
    ["+", 0.5, ["*", ["var", "gx"], 0.2]],
    ["+", 1, ["*", ["var", "gy"], 0.15]],
    ["+", 1.2, ["*", ["var", "gy"], -0.1]]
  ]);
  assert.deepEqual(leaf.rot, [0, ["+", 0.2, ["*", ["var", "gy"], 0.1]], 0]);
});

test("compose reuses the bounded definition grid scale rule", () => {
  const out = run(request("compose-grid-scale", {
    compose: [{ grid: {
      counts: [1, 2, 1],
      step: [0, 0, 0],
      scale_step: { y: -0.2 },
      instance: { use: "panel", scale: 1 }
    } }]
  }));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(leafOf(out).scale, ["+", 1, ["*", ["var", "gy"], -0.2]]);
});

test("grid scale progression fails closed on malformed, wrong-target, coercion, non-positive, overflow, and colliding states", () => {
  const malformed = [
    ["empty", {}, "HOLD_FORM_GRID_INVALID"],
    ["unknown-axis", { q: 0.1 }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["zero-scalar", { x: 0 }, "HOLD_FORM_GRID_INVALID"],
    ["zero-vector", { x: [0, 0, 0] }, "HOLD_FORM_GRID_INVALID"],
    ["mixed-kinds", { x: 0.1, y: [0.1, 0, 0] }, "HOLD_FORM_GRID_INVALID"]
  ];
  for (const [id, scaleStep, code] of malformed) {
    const out = run(request(`grid-scale-${id}`, {
      grid: { counts: [2, 2, 1], step: [0, 0, 0], scale_step: scaleStep, instance: { use: "panel" } }
    }));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.holds[0].code, code, id);
  }

  for (const [id, grid] of [
    ["primitive", { counts: [2,1,1], step: [1,0,0], scale_step: { x: 0.1 }, part: { shape: "box" } }],
    ["inactive-axis", { counts: [1,2,1], step: [0,1,0], scale_step: { x: 0.1 }, instance: { use: "panel" } }],
    ["scalar-step-vector-base", { counts: [2,1,1], step: [1,0,0], scale_step: { x: 0.1 }, instance: { use: "panel", scale: [1,1,1] } }],
    ["vector-step-scalar-base", { counts: [2,1,1], step: [1,0,0], scale_step: { x: [0.1,0,0] }, instance: { use: "panel", scale: 1 } }],
    ["nonpositive", { counts: [3,1,1], step: [0,0,0], scale_step: { x: -0.6 }, instance: { use: "panel", scale: 1 } }],
    ["overflow", { counts: [3,1,1], step: [0,0,0], scale_step: { x: Number.MAX_VALUE }, instance: { use: "panel", scale: Number.MAX_VALUE } }],
    ["collision", { counts: [2,3,1], step: [0,0,0], scale_step: { x: 1, y: -0.5 }, instance: { use: "panel", scale: 5 } }]
  ]) {
    const out = run(request(`grid-scale-${id}`, { grid }));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID", id);
    assert.equal(out.candidate, null, id);
  }
});

test("an active definition grid axis still needs translation, rotation, or scale progression of its own", () => {
  const out = run(request("grid-scale-missing-distinctness", {
    grid: {
      counts: [2, 2, 1],
      step: [1, 0, 0],
      scale_step: { x: 0.1 },
      instance: { use: "panel" }
    }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID");
});

integrationTest("pinned MorphTile consumes multi-axis definition grid scale expressions as finite changing geometry", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const out = run(request("runtime-grid-scale", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      scale_step: { x: 0.2, y: 0.35 },
      rot_step: { y: [0, 0.1, 0] },
      instance: { use: "panel", scale: 0.6 }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const world = MorphTile.createWorld("Form grid scale proof");
  world.defs = {
    panel: {
      id: "panel",
      name: "Panel",
      body: { facets: { mesh: { type: "primitive", source: null, data: { shape: "box", size: [1, 2, 1] } } } }
    }
  };
  const tile = MorphTile.createTile(out.candidate);
  world.tiles[tile.id] = tile;
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));
  const compiled = MorphTile.compileMesh(tile, world);
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 4);
  assert.ok(compiled.P.length > 0);
  assert.ok(compiled.P.every(Number.isFinite));

  const fixedCandidate = JSON.parse(JSON.stringify(out.candidate));
  let fixedLeaf = fixedCandidate.facets.mesh.data.parts[0];
  while (fixedLeaf && Number.isInteger(fixedLeaf.repeat) && Array.isArray(fixedLeaf.body)) fixedLeaf = fixedLeaf.body[0];
  fixedLeaf.scale = 0.6;
  const fixedTile = MorphTile.createTile(fixedCandidate);
  world.tiles[fixedTile.id] = fixedTile;
  const fixedCompiled = MorphTile.compileMesh(fixedTile, world);
  assert.equal(fixedCompiled.hold, null);
  assert.notDeepEqual(compiled.P, fixedCompiled.P, "receiver must consume emitted per-cell definition scale expressions");
});
