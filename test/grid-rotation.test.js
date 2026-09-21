const test = require("node:test");
const assert = require("node:assert/strict");
const baseRequest = require("../fixtures/request.box.json");
const { run } = require("../src");

function request(request_id, intent) {
  return { ...baseRequest, request_id, intent };
}

test("grid may rotate along an active axis without translating on that axis", () => {
  const input = request("grid-rot-x", {
    name: "turning row",
    grid: {
      counts: [3, 1, 1],
      step: [0, 0, 0],
      rot_step: { x: [0, 0.25, 0] },
      part: { shape: "wedge", size: [1, 2, 1], pos: [4, -2, 1], rot: [0, 0.5, 0] }
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
  assert.deepEqual(loop.body[0].rot, [
    0,
    ["+", 0.5, ["*", ["var", "gx"], 0.25]],
    0
  ]);
});

test("multi-axis grid rotation composes fixed variables without materializing placements", () => {
  const out = run(request("grid-rot-xy", {
    grid: {
      counts: [2, 2, 1],
      step: [2, 0, 0],
      rot_step: {
        x: [0, 0.2, 0],
        y: [0.1, 0, 0]
      },
      part: { shape: "wedge", rot: [0.5, 1, 0] }
    }
  }));
  assert.equal(out.status, "CANDIDATE");
  const xLoop = out.candidate.facets.mesh.data.parts[0];
  const yLoop = xLoop.body[0];
  const leaf = yLoop.body[0];
  assert.equal(xLoop.as, "gx");
  assert.equal(yLoop.as, "gy");
  assert.deepEqual(leaf.pos, [["+", 0, ["*", ["var", "gx"], 2]], 0, 0]);
  assert.deepEqual(leaf.rot, [
    ["+", 0.5, ["*", ["var", "gy"], 0.1]],
    ["+", 1, ["*", ["var", "gx"], 0.2]],
    0
  ]);
});

test("compose reuses the same bounded grid rotation rule", () => {
  const out = run(request("compose-grid-rot", {
    name: "turning compose",
    compose: [{
      grid: {
        counts: [1, 2, 1],
        step: [0, 0, 0],
        rot_step: { y: [0.1, 0, 0] },
        instance: { use: "arch.segment", pos: [0, 3, 0] }
      }
    }]
  }));
  assert.equal(out.status, "CANDIDATE");
  const loop = out.candidate.facets.mesh.data.parts[0];
  assert.equal(loop.repeat, 2);
  assert.equal(loop.as, "gy");
  assert.deepEqual(loop.body[0].pos, [0, 3, 0]);
  assert.deepEqual(loop.body[0].rot, [
    ["+", 0, ["*", ["var", "gy"], 0.1]],
    0,
    0
  ]);
});

test("grid rotation progression fails closed on malformed, inactive, duplicate, and non-finite generated states", () => {
  const cases = [
    ["empty", {}, "HOLD_FORM_GRID_INVALID"],
    ["unknown-axis", { q: [0, 1, 0] }, "HOLD_FORM_PARAMETER_UNKNOWN"],
    ["zero-delta", { x: [0, 0, 0] }, "HOLD_FORM_GRID_INVALID"],
    ["inactive-axis", { y: [0, 0.2, 0] }, "HOLD_FORM_GRID_INVALID", [2, 1, 1], [1, 0, 0]],
    ["overflow", { x: [Number.MAX_VALUE, 0, 0] }, "HOLD_FORM_GRID_INVALID", [3, 1, 1], [0, 0, 0]],
    ["collision", { x: [0, 1, 0], y: [0, -1, 0] }, "HOLD_FORM_GRID_INVALID", [2, 2, 1], [0, 0, 0]]
  ];

  for (const [id, rotStep, code, counts = [2, 1, 1], step = [0, 0, 0]] of cases) {
    const out = run(request(`grid-rot-${id}`, {
      grid: {
        counts,
        step,
        rot_step: rotStep,
        part: { shape: "wedge" }
      }
    }));
    assert.equal(out.status, "HOLD", id);
    assert.equal(out.candidate, null, id);
    assert.equal(out.holds[0].code, code, id);
  }
});

test("an active grid axis still needs movement or its own bounded rotation progression", () => {
  const out = run(request("grid-rot-missing-distinctness", {
    grid: {
      counts: [2, 2, 1],
      step: [1, 0, 0],
      rot_step: { x: [0, 0.25, 0] },
      part: { shape: "wedge" }
    }
  }));
  assert.equal(out.status, "HOLD");
  assert.equal(out.holds[0].code, "HOLD_FORM_GRID_INVALID");
});
