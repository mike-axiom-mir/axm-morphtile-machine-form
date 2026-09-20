const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const { run } = require("../src");

function request(intent, requestId = "repeat-size") {
  return {
    envelope_version: "0.1",
    request_id: requestId,
    goal: "Create bounded repeated geometry with deterministic size progression",
    provenance: {},
    intent
  };
}

function firstTarget(out) {
  return out.candidate.facets.mesh.data.parts[0].body[0];
}

test("repeat.size_step compiles bounded positive primitive size progression", () => {
  const out = run(request({
    repeat: {
      count: 4,
      step: [0, 1, 0],
      size_step: [0.25, -0.1, 0],
      part: { shape: "box", size: [1, 1, 0.5] }
    }
  }));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(firstTarget(out).size, [
    ["+", 1, ["*", ["var", "i"], 0.25]],
    ["+", 1, ["*", ["var", "i"], -0.1]],
    0.5
  ]);
});

test("repeat.size_step composes with repeat.rot_step", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [0.5, 0, 0],
      size_step: [0.2, 0, 0],
      rot_step: [0, 0.3, 0],
      part: { shape: "box", size: [1, 1, 1], rot: [0, 0.1, 0] }
    }
  }, "repeat-size-rotation"));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(firstTarget(out).size[0], ["+", 1, ["*", ["var", "i"], 0.2]]);
  assert.deepEqual(firstTarget(out).rot[1], ["+", 0.1, ["*", ["var", "i"], 0.3]]);
});

test("compose reuses the bounded size progression rule", () => {
  const out = run(request({
    compose: [{ repeat: {
      count: 3,
      step: [0, 0.5, 0],
      size_step: [0.1, 0, 0],
      part: { shape: "plane", size: [1, 1, 1] }
    } }]
  }, "compose-repeat-size"));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.facets.mesh.data.parts[0].body[0].size[0], ["+", 1, ["*", ["var", "i"], 0.1]]);
});

test("repeat.size_step fails closed on malformed, no-op, instance, single-copy, non-positive and overflow domains", () => {
  const cases = [
    { id: "malformed", repeat: { count: 3, step: [1,0,0], size_step: [1,0], part: { shape: "box" } } },
    { id: "noop", repeat: { count: 3, step: [1,0,0], size_step: [0,0,0], part: { shape: "box" } } },
    { id: "instance", repeat: { count: 3, step: [1,0,0], size_step: [0.1,0,0], instance: { use: "panel" } } },
    { id: "single", repeat: { count: 1, step: [1,0,0], size_step: [0.1,0,0], part: { shape: "box" } } },
    { id: "nonpositive", repeat: { count: 3, step: [1,0,0], size_step: [-0.6,0,0], part: { shape: "box", size: [1,1,1] } } },
    { id: "overflow", repeat: { count: 2, step: [1,0,0], size_step: [Number.MAX_VALUE,0,0], part: { shape: "box", size: [Number.MAX_VALUE,1,1] } } }
  ];
  for (const item of cases) {
    const out = run(request({ repeat: item.repeat }, `repeat-size-${item.id}`));
    assert.equal(out.status, "HOLD", item.id);
    assert.equal(out.holds[0].code, "HOLD_FORM_REPEAT_INVALID", item.id);
  }
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile runtime executes Form-generated size progression as finite changing geometry", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit);
  const MorphTile = require(path.resolve(runtimePath));
  const growing = run(request({ repeat: {
    count: 4,
    step: [0, 1.2, 0],
    size_step: [0.2, 0.1, 0],
    part: { shape: "box", size: [1, 0.5, 0.5] }
  } }, "runtime-repeat-size"));
  const fixed = run(request({ repeat: {
    count: 4,
    step: [0, 1.2, 0],
    part: { shape: "box", size: [1, 0.5, 0.5] }
  } }, "runtime-repeat-size-fixed"));
  assert.equal(growing.status, "CANDIDATE");
  const growingMesh = MorphTile.compileMesh(MorphTile.createTile(growing.candidate));
  const fixedMesh = MorphTile.compileMesh(MorphTile.createTile(fixed.candidate));
  assert.equal(growingMesh.hold, null);
  assert.equal(fixedMesh.hold, null);
  assert.equal(growingMesh.recipe_parts, 4);
  assert.ok(growingMesh.P.every(Number.isFinite));
  assert.notDeepEqual(growingMesh.P, fixedMesh.P);
});
