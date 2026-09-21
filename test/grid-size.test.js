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

test("primitive grid may change size along a stationary active axis", () => {
  const input = request("grid-size-x", {
    name: "tapering row",
    grid: {
      counts: [3, 1, 1],
      step: [0, 0, 0],
      size_step: { x: [0.25, -0.2, 0] },
      part: { shape: "box", size: [1, 2, 1], pos: [4, -2, 1] }
    }
  });
  const before = JSON.stringify(input);
  const first = run(input), second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);

  const loop = first.candidate.facets.mesh.data.parts[0];
  assert.equal(loop.repeat, 3);
  assert.equal(loop.as, "gx");
  assert.deepEqual(loop.body[0].pos, [4, -2, 1]);
  assert.deepEqual(loop.body[0].size, [
    ["+", 1, ["*", ["var", "gx"], 0.25]],
    ["+", 2, ["*", ["var", "gx"], -0.2]],
    1
  ]);
});

test("grid size and rotation progression compose over the same bounded Cartesian domain", () => {
  const out = run(request("grid-size-rot-xy", {
    grid: {
      counts: [2, 2, 1],
      step: [2, 0, 0],
      size_step: {
        x: [0.2, 0, 0],
        y: [0, 0.3, 0]
      },
      rot_step: { y: [0, 0.1, 0] },
      part: { shape: "wedge", size: [1, 2, 1], rot: [0, 0.5, 0] }
    }
  }));
  assert.equal(out.status, "CANDIDATE");
  const xLoop = out.candidate.facets.mesh.data.parts[0];
  const yLoop = xLoop.body[0];
  const leaf = yLoop.body[0];
  assert.deepEqual(leaf.pos, [["+", 0, ["*", ["var", "gx"], 2]], 0, 0]);
  assert.deepEqual(leaf.size, [
    ["+", 1, ["*", ["var", "gx"], 0.2]],
    ["+", 2, ["*", ["var", "gy"], 0.3]],
    1
  ]);
  assert.deepEqual(leaf.rot, [0, ["+", 0.5, ["*", ["var", "gy"], 0.1]], 0]);
});

test("compose reuses the same bounded grid size rule", () => {
  const out = run(request("compose-grid-size", {
    compose: [{
      grid: {
        counts: [1, 2, 1],
        step: [0, 0, 0],
        size_step: { y: [0.1, 0.2, 0] },
        part: { shape: "box", size: [1, 1, 1], pos: [0, 3, 0] }
      }
    }]
  }));
  assert.equal(out.status, "CANDIDATE");
  const loop = out.candidate.facets.mesh.data.parts[0];
  assert.equal(loop.as, "gy");
  assert.deepEqual(loop.body[0].pos, [0, 3, 0]);
  assert.deepEqual(loop.body[0].size, [
    ["+", 1, ["*", ["var", "gy"], 0.1]],
    ["+", 1, ["*", ["var", "gy"], 0.2]],
    1
  ]);
});

test("grid size progression fails closed on malformed, wrong-target, non-positive, overflow, and colliding states", () => {
  const malformed = [
    ["empty", {}, "HOLD_FORM_GRID_INVALID"],
    ["unknown-axis", { q: [1, 0, 0] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["zero-delta", { x: [0, 0, 0] }, "HOLD_FORM_GRID_INVALID"],
    ["inactive-axis", { y: [0.1, 0, 0] }, "HOLD_FORM_GRID_INVALID"]
  ];
  for (const [id, sizeStep, code] of malformed) {
    const out = run(request(`grid-size-${id}`, {
      grid: {
        counts: [2, 1, 1],
        step: [0, 0, 0],
        size_step: sizeStep,
        part: { shape: "box", size: [2, 2, 2] }
      }
    }));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.holds[0].code, code, id);
  }

  const wrongTarget = run(request("grid-size-instance", {
    grid: {
      counts: [2, 1, 1], step: [1, 0, 0], size_step: { x: [0.1, 0, 0] }, instance: { use: "arch.segment" }
    }
  }));
  assert.equal(wrongTarget.status, "HOLD");
  assert.equal(wrongTarget.holds[0].code, "HOLD_FORM_GRID_INVALID");

  const nonPositive = run(request("grid-size-nonpositive", {
    grid: {
      counts: [3, 1, 1], step: [0, 0, 0], size_step: { x: [-0.6, 0, 0] }, part: { shape: "box", size: [1, 1, 1] }
    }
  }));
  assert.equal(nonPositive.status, "HOLD");
  assert.equal(nonPositive.holds[0].code, "HOLD_FORM_GRID_INVALID");

  const overflow = run(request("grid-size-overflow", {
    grid: {
      counts: [3, 1, 1], step: [0, 0, 0], size_step: { x: [Number.MAX_VALUE, 0, 0] }, part: { shape: "box", size: [1, 1, 1] }
    }
  }));
  assert.equal(overflow.status, "HOLD");
  assert.equal(overflow.holds[0].code, "HOLD_FORM_GRID_INVALID");

  const collision = run(request("grid-size-collision", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      size_step: { x: [1, 0, 0], y: [-1, 0, 0] },
      part: { shape: "box", size: [10, 1, 1] }
    }
  }));
  assert.equal(collision.status, "HOLD");
  assert.equal(collision.holds[0].code, "HOLD_FORM_GRID_INVALID");
});

test("an active grid axis still needs translation, rotation, or size progression of its own", () => {
  const out = run(request("grid-size-missing-distinctness", {
    grid: {
      counts: [2, 2, 1],
      step: [1, 0, 0],
      size_step: { x: [0.1, 0, 0] },
      part: { shape: "box" }
    }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID");
});

integrationTest("pinned MorphTile consumes multi-axis grid size expressions as finite changing geometry", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const out = run(request("runtime-grid-size", {
    grid: {
      counts: [2, 2, 1],
      step: [0, 0, 0],
      size_step: {
        x: [0.25, 0, 0],
        y: [0, 0.15, 0]
      },
      rot_step: { y: [0, 0.1, 0] },
      part: { shape: "wedge", size: [1, 2, 1] }
    }
  }));
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));
  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 4);
  assert.ok(compiled.P.length > 0);
  assert.ok(compiled.P.every((value) => Number.isFinite(value)));

  const fixedCandidate = JSON.parse(JSON.stringify(out.candidate));
  fixedCandidate.facets.mesh.data.parts[0].body[0].body[0].size = [1, 2, 1];
  const fixedCompiled = MorphTile.compileMesh(MorphTile.createTile(fixedCandidate));
  assert.equal(fixedCompiled.hold, null);
  assert.notDeepEqual(compiled.P, fixedCompiled.P, "receiver must consume emitted multi-axis per-cell size expressions");
});
