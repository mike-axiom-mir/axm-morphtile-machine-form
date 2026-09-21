const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
const { run } = require("../src");
const {
  leafOf,
  affineExpression,
  axisAlignedVectorDeltas
} = require("../src/grid-progression");

function request(request_id, intent) {
  return { ...base, request_id, intent };
}

function expectedPosition(basePos, step, counts) {
  const deltas = axisAlignedVectorDeltas(step, counts);
  return basePos.map((baseValue, component) => affineExpression(baseValue, component, deltas));
}

test("base grid emission reuses canonical axis-aligned position arithmetic without emitting inactive-axis variables", () => {
  const counts = [2, 1, 3];
  const step = [0.5, 99, -1];
  const basePos = [10, -2, 3];
  const input = request("grid-position-kernel-base", {
    grid: {
      counts,
      step,
      part: { shape: "box", pos: basePos }
    }
  });
  const before = JSON.stringify(input);
  const first = run(input);
  const second = run(input);

  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), before);

  const root = first.candidate.facets.mesh.data.parts[0];
  const leaf = leafOf(root);
  assert.equal(root.as, "gx");
  assert.equal(root.body[0].as, "gz");
  assert.deepEqual(leaf.pos, expectedPosition(basePos, step, counts));
  assert.deepEqual(leaf.pos, [
    ["+", 10, ["*", ["var", "gx"], 0.5]],
    -2,
    ["+", 3, ["*", ["var", "gz"], -1]]
  ]);
});

test("progression-bearing grid keeps the same canonical position expression while another state component progresses", () => {
  const counts = [2, 1, 2];
  const step = [1.5, 0, -2];
  const basePos = [4, 5, 6];
  const out = run(request("grid-position-kernel-rotation", {
    grid: {
      counts,
      step,
      part: { shape: "wedge", pos: basePos, rot: [0, 0, 0] },
      rot_step: { x: [0, 15, 0] }
    }
  }));

  assert.equal(out.status, "CANDIDATE");
  const leaf = leafOf(out.candidate.facets.mesh.data.parts[0]);
  assert.deepEqual(leaf.pos, expectedPosition(basePos, step, counts));
});

test("grid position kernel convergence preserves the existing finite-domain HOLD detail", () => {
  const out = run(request("grid-position-kernel-overflow", {
    grid: {
      counts: [2, 1, 1],
      step: [Number.MAX_VALUE, 0, 0],
      part: { shape: "box", pos: [Number.MAX_VALUE, 0, 0] }
    }
  }));

  assert.equal(out.status, "HOLD");
  assert.equal(out.candidate, null);
  assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID");
  assert.equal(out.holds[0].detail, "grid position axis 0 produces a non-finite generated value at index 1");
});
