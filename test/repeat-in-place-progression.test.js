const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
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
