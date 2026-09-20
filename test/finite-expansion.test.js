const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

function assertHold(output, code) {
  assert.equal(output.status, "HOLD");
  assert.equal(output.candidate, null);
  assert.equal(output.holds[0].code, code);
  assert.match(output.holds[0].detail, /non-finite generated value/);
}

test("rejects non-finite repeat setting expansion from finite authored values", () => {
  const out = run(request("repeat-setting-overflow", {
    repeat: {
      count: 2,
      step: [1, 0, 0],
      instance: {
        use: "panel",
        with: { width: Number.MAX_VALUE }
      },
      with_step: { width: Number.MAX_VALUE }
    }
  }));

  assertHold(out, "HOLD_FORM_REPEAT_INVALID");
});

test("rejects non-finite repeat position expansion from finite authored values", () => {
  const out = run(request("repeat-position-overflow", {
    repeat: {
      count: 2,
      step: [Number.MAX_VALUE, 0, 0],
      part: {
        shape: "plane",
        pos: [Number.MAX_VALUE, 0, 0]
      }
    }
  }));

  assertHold(out, "HOLD_FORM_REPEAT_INVALID");
});

test("rejects non-finite grid position expansion from finite authored values", () => {
  const out = run(request("grid-position-overflow", {
    grid: {
      counts: [2, 1, 1],
      step: [Number.MAX_VALUE, 0, 0],
      part: {
        shape: "plane",
        pos: [Number.MAX_VALUE, 0, 0]
      }
    }
  }));

  assertHold(out, "HOLD_FORM_GRID_INVALID");
});

test("retains a large bounded progression when every generated value stays finite", () => {
  const out = run(request("repeat-setting-large-finite", {
    repeat: {
      count: 2,
      step: [1, 0, 0],
      instance: {
        use: "panel",
        with: { width: Number.MAX_VALUE }
      },
      with_step: { width: -Number.MAX_VALUE }
    }
  }));

  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.facets.mesh.data.parts[0].body[0].with.width, [
    "+",
    Number.MAX_VALUE,
    ["*", ["var", "i"], -Number.MAX_VALUE]
  ]);
});
