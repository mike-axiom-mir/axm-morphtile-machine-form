const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const base = require("../fixtures/request.box.json");
const manifest = require("../machine.json");
const { run } = require("../src");

function request(request_id, repeat) {
  return {
    ...base,
    request_id,
    intent: { name: request_id, repeat }
  };
}

function expectCandidate(id, repeat) {
  const out = run(request(id, repeat));
  assert.equal(out.status, "CANDIDATE", `${id}: ${out.holds?.[0]?.detail || "unexpected HOLD"}`);
  assert.equal(out.holds.length, 0, id);
  return out.candidate.facets.mesh.data.parts[0];
}

test("repeat may stay in place when bounded rotation progression changes the target", () => {
  const repeated = expectCandidate("in-place-rotation", {
    count: 3,
    step: [0, 0, 0],
    part: { shape: "box", size: [2, 1, 1] },
    rot_step: [0, 0, 30]
  });
  assert.deepEqual(repeated.body[0].pos, [0, 0, 0]);
  assert.deepEqual(repeated.body[0].rot, [0, 0, ["+", 0, ["*", ["var", "i"], 30]]]);
});

test("repeat may stay in place when bounded primitive size progression changes the target", () => {
  const repeated = expectCandidate("in-place-size", {
    count: 3,
    step: [0, 0, 0],
    part: { shape: "box", size: [1, 1, 1] },
    size_step: [0.5, 0.25, 0]
  });
  assert.deepEqual(repeated.body[0].pos, [0, 0, 0]);
  assert.deepEqual(repeated.body[0].size, [
    ["+", 1, ["*", ["var", "i"], 0.5]],
    ["+", 1, ["*", ["var", "i"], 0.25]],
    1
  ]);
});

test("repeat may stay in place when bounded definition scale progression changes the target", () => {
  const repeated = expectCandidate("in-place-scale", {
    count: 3,
    step: [0, 0, 0],
    instance: { use: "panel", scale: [1, 1, 1] },
    scale_step: [0.5, 0.25, 0]
  });
  assert.deepEqual(repeated.body[0].pos, [0, 0, 0]);
  assert.deepEqual(repeated.body[0].scale, [
    ["+", 1, ["*", ["var", "i"], 0.5]],
    ["+", 1, ["*", ["var", "i"], 0.25]],
    1
  ]);
});

test("repeat may stay in place when bounded definition setting progression changes the target", () => {
  const repeated = expectCandidate("in-place-setting", {
    count: 3,
    step: [0, 0, 0],
    instance: { use: "panel", with: { width: 1 } },
    with_step: { width: 0.5 }
  });
  assert.deepEqual(repeated.body[0].pos, [0, 0, 0]);
  assert.deepEqual(repeated.body[0].with.width, ["+", 1, ["*", ["var", "i"], 0.5]]);
});

test("compose reuses the same in-place repeat distinctness rule", () => {
  const out = run({
    ...base,
    request_id: "compose-in-place-size",
    intent: {
      name: "compose in-place size",
      compose: [{ repeat: {
        count: 3,
        step: [0, 0, 0],
        part: { shape: "box", size: [1, 1, 1] },
        size_step: [0.25, 0, 0]
      } }]
    }
  });
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.facets.mesh.data.parts[0].body[0].pos, [0, 0, 0]);
  assert.deepEqual(out.candidate.facets.mesh.data.parts[0].body[0].size[0], ["+", 1, ["*", ["var", "i"], 0.25]]);
});

test("zero translation without another bounded progression still HOLDs", () => {
  const out = run(request("in-place-no-progression", {
    count: 3,
    step: [0, 0, 0],
    part: { shape: "box" }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
});

test("setting progression requires at least two placements so the authored delta can take effect", () => {
  const out = run(request("single-setting-progression", {
    count: 1,
    step: [1, 0, 0],
    instance: { use: "panel", with: { width: 1 } },
    with_step: { width: 0.5 }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile runtime compiles in-place progression as finite changing geometry", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const out = run(request("runtime-in-place-size-rotation", {
    count: 3,
    step: [0, 0, 0],
    part: { shape: "box", size: [1, 0.5, 0.5] },
    size_step: [0.25, 0.1, 0],
    rot_step: [0, 0, 15]
  }));
  assert.equal(out.status, "CANDIDATE");

  const compiled = MorphTile.compileMesh(MorphTile.createTile(out.candidate));
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 3);
  assert.ok(compiled.P.length > 0);
  assert.ok(compiled.P.every(Number.isFinite));
});
