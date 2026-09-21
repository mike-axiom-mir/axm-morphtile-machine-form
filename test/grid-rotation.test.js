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
