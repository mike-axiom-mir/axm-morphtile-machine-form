const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
const { run } = require("../src");
const { linearExpression } = require("../src/repeat-progression");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

test("base repeat translation and definition settings share canonical repeat expressions", () => {
  const input = request("repeat-base-kernel-convergence", {
    repeat: {
      count: 4,
      step: [0.5, 0, -1],
      instance: {
        use: "panel",
        pos: [10, -2, 3],
        with: { depth: 4, width: 2 }
      },
      with_step: { width: -0.25 }
    }
  });

  const before = JSON.stringify(input);
  const first = run(input);
  const second = run(input);

  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);

  const body = first.candidate.facets.mesh.data.parts[0].body[0];
  assert.deepEqual(body.pos, [
    linearExpression(10, 0.5),
    linearExpression(-2, 0),
    linearExpression(3, -1)
  ]);
  assert.equal(body.with.depth, 4);
  assert.deepEqual(body.with.width, linearExpression(2, -0.25));
});

test("base repeat kernel convergence preserves existing finite-domain HOLD details", () => {
  const position = run(request("repeat-base-position-overflow", {
    repeat: {
      count: 2,
      step: [Number.MAX_VALUE, 0, 0],
      part: { shape: "box", pos: [Number.MAX_VALUE, 0, 0] }
    }
  }));
  assert.equal(position.status, "HOLD");
  assert.equal(position.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
  assert.equal(position.holds[0].detail, "repeat position axis 0 produces a non-finite generated value at index 1");

  const setting = run(request("repeat-base-setting-overflow", {
    repeat: {
      count: 2,
      step: [1, 0, 0],
      instance: { use: "panel", with: { width: Number.MAX_VALUE } },
      with_step: { width: Number.MAX_VALUE }
    }
  }));
  assert.equal(setting.status, "HOLD");
  assert.equal(setting.holds[0].code, "HOLD_FORM_REPEAT_INVALID");
  assert.equal(setting.holds[0].detail, "repeat.with_step.width produces a non-finite generated value at index 1");
});
