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

test("definition setting grids reuse canonical axis-aligned position arithmetic", () => {
  const counts = [2, 1, 3];
  const step = [0.5, 99, -1];
  const basePos = [10, -2, 3];
  const input = request("grid-settings-position-kernel", {
    grid: {
      counts,
      step,
      with_step: { x: { width: 0.25 } },
      instance: {
        use: "panel",
        with: { width: 1 },
        pos: basePos
      }
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
  assert.deepEqual(leaf.with.width, ["+", 1, ["*", ["var", "gx"], 0.25]]);
});
