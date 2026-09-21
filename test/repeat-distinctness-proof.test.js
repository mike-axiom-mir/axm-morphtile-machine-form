const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
const { run } = require("../src");

function request(request_id, repeat) {
  return { ...base, request_id, intent: { repeat } };
}

test("repeat rejects finite non-zero translation that collapses to a duplicate generated state", () => {
  const input = request("repeat-translation-precision-collapse", {
    count: 2,
    step: [1, 0, 0],
    part: {
      shape: "box",
      pos: [Number.MAX_SAFE_INTEGER + 1, 0, 0]
    }
  });

  const before = JSON.stringify(input);
  const out = run(input);
  assert.equal(out.status, "HOLD");
  assert.equal(out.candidate, null);
  assert.equal(out.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
  assert.match(out.holds[0].detail, /duplicate authored state/);
  assert.equal(JSON.stringify(input), before);
});

test("repeat rejects in-place progression when its finite authored delta collapses numerically", () => {
  const input = request("repeat-rotation-precision-collapse", {
    count: 2,
    step: [0, 0, 0],
    part: {
      shape: "box",
      rot: [1, 0, 0]
    },
    rot_step: [Number.MIN_VALUE, 0, 0]
  });

  const before = JSON.stringify(input);
  const out = run(input);
  assert.equal(out.status, "HOLD");
  assert.equal(out.candidate, null);
  assert.equal(out.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
  assert.match(out.holds[0].detail, /duplicate authored state/);
  assert.equal(JSON.stringify(input), before);
});

test("repeat complete-state proof preserves ordinary distinct in-place progression", () => {
  const input = request("repeat-distinct-setting-progression", {
    count: 3,
    step: [0, 0, 0],
    instance: {
      use: "panel",
      with: { width: 1 }
    },
    with_step: { width: 1 }
  });

  const first = run(input);
  const second = run(input);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.deepEqual(first.candidate.facets.mesh.data.parts[0].body[0].pos, [0, 0, 0]);
  assert.deepEqual(first.candidate.facets.mesh.data.parts[0].body[0].with.width, ["+", 1, ["*", ["var", "i"], 1]]);
});
