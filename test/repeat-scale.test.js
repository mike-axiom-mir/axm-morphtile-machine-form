const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const { run } = require("../src");

function request(intent, requestId = "repeat-scale") {
  return {
    envelope_version: "0.1",
    request_id: requestId,
    goal: "Create bounded repeated reusable geometry with deterministic scale progression",
    provenance: {},
    intent
  };
}

function firstTarget(out) {
  return out.candidate.facets.mesh.data.parts[0].body[0];
}

test("repeat.scale_step compiles bounded positive scalar scale progression for definition instances", () => {
  const input = request({
    repeat: {
      count: 4,
      step: [1.5, 0, 0],
      scale_step: 0.2,
      instance: { use: "panel", scale: 0.5 }
    }
  });
  const before = JSON.stringify(input);
  const out = run(input);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(firstTarget(out).scale, ["+", 0.5, ["*", ["var", "i"], 0.2]]);
});

test("repeat.scale_step compiles bounded positive vector scale progression for definition instances", () => {
  const input = request({
    repeat: {
      count: 4,
      step: [1.5, 0, 0],
      scale_step: [0.2, -0.1, 0],
      instance: { use: "panel", scale: [0.5, 1.2, 0.8] }
    }
  }, "repeat-vector-scale");
  const before = JSON.stringify(input);
  const out = run(input);
  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(firstTarget(out).scale, [
    ["+", 0.5, ["*", ["var", "i"], 0.2]],
    ["+", 1.2, ["*", ["var", "i"], -0.1]],
    0.8
  ]);
});

test("vector repeat.scale_step may start from MorphTile's implicit unit vector scale", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [0, 1, 0],
      scale_step: [0.2, 0, -0.1],
      instance: { use: "panel" }
    }
  }, "repeat-vector-scale-default"));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(firstTarget(out).scale, [
    ["+", 1, ["*", ["var", "i"], 0.2]],
    1,
    ["+", 1, ["*", ["var", "i"], -0.1]]
  ]);
});

test("scalar repeat.scale_step can start from MorphTile's implicit unit scale", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [0, 1, 0],
      scale_step: -0.2,
      instance: { use: "panel" }
    }
  }, "repeat-scale-default"));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(firstTarget(out).scale, ["+", 1, ["*", ["var", "i"], -0.2]]);
});

test("repeat.scale_step composes with repeat.rot_step and definition with_step", () => {
  const out = run(request({
    repeat: {
      count: 3,
      step: [1, 0, 0],
      scale_step: 0.1,
      rot_step: [0, 0.25, 0],
      with_step: { width: 0.5 },
      instance: { use: "panel", scale: 0.8, rot: [0, 0.1, 0], with: { width: 2 } }
    }
  }, "repeat-scale-compose-existing"));
  assert.equal(out.status, "CANDIDATE");
  const target = firstTarget(out);
  assert.deepEqual(target.scale, ["+", 0.8, ["*", ["var", "i"], 0.1]]);
  assert.deepEqual(target.rot[1], ["+", 0.1, ["*", ["var", "i"], 0.25]]);
  assert.deepEqual(target.with.width, ["+", 2, ["*", ["var", "i"], 0.5]]);
});

test("intent.compose reuses the bounded definition scale progression rule", () => {
  const out = run(request({
    compose: [{ repeat: {
      count: 3,
      step: [0, 0, 1],
      scale_step: [0.15, 0, -0.1],
      instance: { use: "panel", scale: [0.7, 1, 1.2] }
    } }]
  }, "compose-repeat-scale"));
  assert.equal(out.status, "CANDIDATE");
  assert.deepEqual(out.candidate.facets.mesh.data.parts[0].body[0].scale, [
    ["+", 0.7, ["*", ["var", "i"], 0.15]],
    1,
    ["+", 1.2, ["*", ["var", "i"], -0.1]]
  ]);
});

test("repeat.scale_step fails closed on malformed, no-op, target mismatch, base mismatch, non-positive and overflow domains", () => {
  const cases = [
    { id: "malformed-vector", repeat: { count: 3, step: [1,0,0], scale_step: [0.1,0], instance: { use: "panel", scale: [1,1,1] } } },
    { id: "nonfinite-vector", code: "HOLD_FORM_INPUT_NONFINITE_VALUE", repeat: { count: 3, step: [1,0,0], scale_step: [0.1,Infinity,0], instance: { use: "panel", scale: [1,1,1] } } },
    { id: "noop-scalar", repeat: { count: 3, step: [1,0,0], scale_step: 0, instance: { use: "panel" } } },
    { id: "noop-vector", repeat: { count: 3, step: [1,0,0], scale_step: [0,0,0], instance: { use: "panel", scale: [1,1,1] } } },
    { id: "primitive", repeat: { count: 3, step: [1,0,0], scale_step: 0.1, part: { shape: "box" } } },
    { id: "single", repeat: { count: 1, step: [1,0,0], scale_step: 0.1, instance: { use: "panel" } } },
    { id: "scalar-step-vector-base", repeat: { count: 3, step: [1,0,0], scale_step: 0.1, instance: { use: "panel", scale: [1,1,1] } } },
    { id: "vector-step-scalar-base", repeat: { count: 3, step: [1,0,0], scale_step: [0.1,0,0], instance: { use: "panel", scale: 1 } } },
    { id: "nonpositive-scalar", repeat: { count: 3, step: [1,0,0], scale_step: -0.6, instance: { use: "panel", scale: 1 } } },
    { id: "nonpositive-vector", repeat: { count: 3, step: [1,0,0], scale_step: [0,-0.6,0], instance: { use: "panel", scale: [1,1,1] } } },
    { id: "overflow-scalar", repeat: { count: 2, step: [1,0,0], scale_step: Number.MAX_VALUE, instance: { use: "panel", scale: Number.MAX_VALUE } } },
    { id: "overflow-vector", repeat: { count: 2, step: [1,0,0], scale_step: [Number.MAX_VALUE,0,0], instance: { use: "panel", scale: [Number.MAX_VALUE,1,1] } } }
  ];
  for (const item of cases) {
    const out = run(request({ repeat: item.repeat }, `repeat-scale-${item.id}`));
    assert.equal(out.status, "HOLD", item.id);
    assert.equal(out.holds[0].code, item.code || "HOLD_FORM_REPEAT_INVALID", item.id);
    assert.equal(out.candidate, null, item.id);
  }
});

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

integrationTest("pinned MorphTile runtime executes scalar and vector definition scale progression as finite changing geometry", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit);
  const MorphTile = require(path.resolve(runtimePath));

  function compile(candidate) {
    const world = MorphTile.createWorld("Form scale proof");
    world.defs = {
      panel: {
        id: "panel",
        name: "Panel",
        body: {
          facets: {
            mesh: { type: "primitive", source: null, data: { shape: "box", size: [1, 1, 1] } },
            material: { type: "primitive", source: null, data: { color: [0.7, 0.7, 0.9] } }
          }
        }
      }
    };
    const tile = MorphTile.createTile(candidate);
    world.tiles[tile.id] = tile;
    return MorphTile.compileMesh(tile, world);
  }

  const scalarGrowing = run(request({ repeat: {
    count: 3,
    step: [2, 0, 0],
    scale_step: 0.25,
    instance: { use: "panel", scale: 0.5 }
  } }, "runtime-repeat-scale"));
  const scalarFixed = run(request({ repeat: {
    count: 3,
    step: [2, 0, 0],
    instance: { use: "panel", scale: 0.5 }
  } }, "runtime-repeat-scale-fixed"));
  const vectorGrowing = run(request({ repeat: {
    count: 3,
    step: [2, 0, 0],
    scale_step: [0.25, -0.1, 0],
    instance: { use: "panel", scale: [0.5, 1.2, 0.8] }
  } }, "runtime-repeat-vector-scale"));
  const vectorFixed = run(request({ repeat: {
    count: 3,
    step: [2, 0, 0],
    instance: { use: "panel", scale: [0.5, 1.2, 0.8] }
  } }, "runtime-repeat-vector-scale-fixed"));

  for (const out of [scalarGrowing, scalarFixed, vectorGrowing, vectorFixed]) {
    assert.equal(out.status, "CANDIDATE");
  }

  const scalarGrowingMesh = compile(scalarGrowing.candidate);
  const scalarFixedMesh = compile(scalarFixed.candidate);
  const vectorGrowingMesh = compile(vectorGrowing.candidate);
  const vectorFixedMesh = compile(vectorFixed.candidate);

  for (const mesh of [scalarGrowingMesh, scalarFixedMesh, vectorGrowingMesh, vectorFixedMesh]) {
    assert.equal(mesh.hold, null);
    assert.ok(mesh.P.length > 0);
    assert.ok(mesh.P.every(Number.isFinite));
  }
  assert.notDeepEqual(scalarGrowingMesh.P, scalarFixedMesh.P);
  assert.notDeepEqual(vectorGrowingMesh.P, vectorFixedMesh.P);
});
