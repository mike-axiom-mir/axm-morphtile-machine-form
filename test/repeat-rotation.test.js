const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const { run } = require("../src");

function request(intent, requestId = "repeat-rotation") {
  return {
    envelope_version: "0.1",
    request_id: requestId,
    goal: "Create bounded repeated geometry with deterministic rotation progression",
    provenance: {},
    intent
  };
}

function firstRepeatTarget(result) {
  return result.candidate.facets.mesh.data.parts[0].body[0];
}

test("repeat.rot_step compiles bounded primitive rotation without caller-authored expressions", () => {
  const out = run(request({
    name: "turning stair",
    repeat: {
      count: 4,
      step: [0.25, 0.5, 0],
      rot_step: [0, 0.4, 0],
      part: { shape: "box", size: [1, 0.2, 0.35], pos: [1, 0, 0], rot: [0, 0.1, 0] }
    }
  }));

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(firstRepeatTarget(out).rot, [
    0,
    ["+", 0.1, ["*", ["var", "i"], 0.4]],
    0
  ]);
});

test("repeat.rot_step works for definition instances and keeps runtime-resolution warning", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [0, 1, 0],
      rot_step: [0, 0, 0.25],
      instance: { use: "panel", rot: [0, 0, 0.5], with: { width: 1 } }
    }
  }, "repeat-rotation-definition"));

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(firstRepeatTarget(out).rot, [0, 0, ["+", 0.5, ["*", ["var", "i"], 0.25]]]);
  assert.ok(out.warnings.some((warning) => warning.code === "DEFINITION_RUNTIME_RESOLUTION_REQUIRED"));
});

test("repeat.rot_step and repeat.with_step coexist on one bounded definition repeat", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [0, 1, 0],
      rot_step: [0, 0.2, 0],
      with_step: { width: 0.5 },
      instance: { use: "panel", with: { width: 1 }, rot: [0, 0.1, 0] }
    }
  }, "repeat-rotation-and-setting"));

  assert.equal(out.status, "CANDIDATE");
  const target = firstRepeatTarget(out);
  assert.deepEqual(target.rot, [0, ["+", 0.1, ["*", ["var", "i"], 0.2]], 0]);
  assert.deepEqual(target.with, { width: ["+", 1, ["*", ["var", "i"], 0.5]] });
});

test("compose repeat blocks reuse the same bounded rotation rule", () => {
  const out = run(request({
    compose: [
      { part: { shape: "plane", size: [1, 1, 1] } },
      {
        repeat: {
          count: 3,
          step: [0, 0.5, 0],
          rot_step: [0, 0.3, 0],
          part: { shape: "box", size: [0.5, 0.1, 0.2], pos: [1, 0, 0] }
        }
      }
    ]
  }, "compose-repeat-rotation"));

  assert.equal(out.status, "CANDIDATE");
  assert.equal(out.candidate.facets.mesh.data.parts.length, 2);
  assert.deepEqual(out.candidate.facets.mesh.data.parts[1].body[0].rot, [
    0,
    ["+", 0, ["*", ["var", "i"], 0.3]],
    0
  ]);
});

test("repeat.rot_step rejects malformed, no-op and non-finite generated rotations", () => {
  const malformed = run(request({
    repeat: { count: 3, step: [0, 1, 0], rot_step: [0, 1], part: { shape: "box" } }
  }, "repeat-rotation-malformed"));
  assert.equal(malformed.status, "HOLD");
  assert.equal(malformed.holds[0].code, "HOLD_FORM_REPEAT_INVALID");

  const noOp = run(request({
    repeat: { count: 3, step: [0, 1, 0], rot_step: [0, 0, 0], part: { shape: "box" } }
  }, "repeat-rotation-noop"));
  assert.equal(noOp.status, "HOLD");
  assert.equal(noOp.holds[0].code, "HOLD_FORM_REPEAT_INVALID");

  const single = run(request({
    repeat: { count: 1, step: [0, 1, 0], rot_step: [0, 0.5, 0], part: { shape: "box" } }
  }, "repeat-rotation-single"));
  assert.equal(single.status, "HOLD");
  assert.match(single.holds[0].detail, /at least 2/);

  const overflow = run(request({
    repeat: {
      count: 2,
      step: [0, 1, 0],
      rot_step: [Number.MAX_VALUE, 0, 0],
      part: { shape: "box", rot: [Number.MAX_VALUE, 0, 0] }
    }
  }, "repeat-rotation-overflow"));
  assert.equal(overflow.status, "HOLD");
  assert.equal(overflow.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
  assert.match(overflow.holds[0].detail, /non-finite generated value/);
});

test("repeat rotation wrapper preserves fail-closed unknown-field handling", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [0, 1, 0],
      rot_step: [0, 0.25, 0],
      invented: true,
      part: { shape: "box" }
    }
  }, "repeat-rotation-unknown"));

  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_PARAMETER_UNKNOWN");
  assert.match(out.holds[0].detail, /invented/);
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile runtime executes Form-generated repeat rotation expressions", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const intent = {
    repeat: {
      count: 4,
      step: [0.12, 0.45, 0],
      rot_step: [0, 0.5, 0],
      part: { shape: "box", size: [1.1, 0.12, 0.24], pos: [1, 0, 0] }
    }
  };

  const turning = run(request(intent, "runtime-repeat-rotation"));
  const straight = run(request({
    repeat: {
      count: 4,
      step: [0.12, 0.45, 0],
      part: { shape: "box", size: [1.1, 0.12, 0.24], pos: [1, 0, 0] }
    }
  }, "runtime-repeat-straight"));

  assert.equal(turning.status, "CANDIDATE");
  assert.equal(straight.status, "CANDIDATE");

  const turningTile = MorphTile.createTile(turning.candidate);
  const straightTile = MorphTile.createTile(straight.candidate);
  assert.equal(MorphTile.validateTile(turningTile).ok, true);
  assert.equal(MorphTile.validateTile(straightTile).ok, true);

  const turningMesh = MorphTile.compileMesh(turningTile);
  const straightMesh = MorphTile.compileMesh(straightTile);
  assert.equal(turningMesh.hold, null);
  assert.equal(straightMesh.hold, null);
  assert.equal(turningMesh.recipe_parts, 4);
  assert.equal(turningMesh.T.length, straightMesh.T.length);
  assert.ok(turningMesh.P.every((value) => Number.isFinite(value)));
  assert.notDeepEqual(turningMesh.P, straightMesh.P, "runtime geometry must reflect generated rotation progression");
});
