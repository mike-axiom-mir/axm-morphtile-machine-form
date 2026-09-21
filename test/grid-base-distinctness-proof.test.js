const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

const COLLAPSING_BASE = Number.MAX_SAFE_INTEGER + 1;

function collapsingGrid() {
  return {
    counts: [2, 1, 1],
    step: [1, 0, 0],
    part: { shape: "box", pos: [COLLAPSING_BASE, 0, 0] }
  };
}

test("base grid rejects finite non-zero translation that collapses to a duplicate generated position", () => {
  assert.equal(COLLAPSING_BASE + 1, COLLAPSING_BASE, "fixture must exercise JavaScript numeric collapse");
  const input = request("grid-position-collapse", { grid: collapsingGrid() });
  const before = JSON.stringify(input);

  const first = run(input);
  const second = run(input);

  assert.equal(first.status, "HOLD");
  assert.equal(first.candidate, null);
  assert.equal(first.holds[0].code, "HOLD_FORM_GRID_INVALID");
  assert.match(first.holds[0].detail, /duplicate authored state at \[1,0,0\]/);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);
});

test("compose reuses the same base-grid generated-position distinctness proof", () => {
  const out = run(request("compose-grid-position-collapse", {
    compose: [{ grid: collapsingGrid() }]
  }));

  assert.equal(out.status, "HOLD");
  assert.equal(out.candidate, null);
  assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID");
  assert.match(out.holds[0].detail, /compose\[0\]\.grid: .*duplicate authored state at \[1,0,0\]/);
});

test("a collapsed translation component remains valid when bounded rotation progression distinguishes the complete grid state", () => {
  const out = run(request("grid-position-collapse-with-rotation", {
    grid: {
      ...collapsingGrid(),
      rot_step: { x: [0, 15, 0] }
    }
  }));

  assert.equal(out.status, "CANDIDATE");
});
