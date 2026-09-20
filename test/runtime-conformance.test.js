const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const manifest = require("../machine.json");
const composedRequest = require("../fixtures/request.composed.json");
const partsRequest = require("../fixtures/request.parts.json");
const baseRequest = require("../fixtures/request.box.json");
const { run } = require("../src");

const runtimePath = process.env.MORPHTILE_CORE_PATH;
const runtimeCommit = process.env.MORPHTILE_COMMIT;
const integrationTest = runtimePath ? test : test.skip;

function requestFor(shape) {
  return {
    ...baseRequest,
    request_id: `runtime-${shape}`,
    intent: { shape, name: `runtime ${shape}` }
  };
}

integrationTest("pinned MorphTile runtime accepts and compiles every emitted primitive", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const expectedTriangles = {
    box: 108,
    sphere: 224,
    cylinder: 56,
    cone: 42,
    wedge: 8,
    plane: 2
  };

  for (const [shape, triangles] of Object.entries(expectedTriangles)) {
    const result = run(requestFor(shape));
    assert.equal(result.status, "CANDIDATE", shape);

    const tile = MorphTile.createTile(result.candidate);
    const validity = MorphTile.validateTile(tile);
    assert.equal(validity.ok, true, `${shape}: ${validity.errors.join(", ")}`);

    const compiled = MorphTile.compileMesh(tile);
    assert.equal(compiled.hold, null, shape);
    assert.equal(compiled.T.length, triangles, `${shape} triangle receipt drifted`);
    assert.equal(compiled.P.length, triangles * 9, `${shape} position receipt drifted`);
  }
});

integrationTest("pinned recipe compiler executes one caller-supplied composed Form Machine candidate with a bounded receipt", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const result = run(composedRequest);
  assert.equal(result.status, "CANDIDATE");
  assert.equal(result.candidate.facets.mesh.type, "generated");
  assert.equal(result.candidate.facets.mesh.data.generator, "recipe");

  const tile = MorphTile.createTile(result.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 3);
  assert.equal(compiled.T.length, 348, "composed recipe triangle receipt drifted");
  assert.equal(compiled.P.length, 348 * 9, "composed recipe position receipt drifted");
});

integrationTest("pinned recipe compiler executes normalized bounded parts with the same deterministic receipt", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));

  const result = run(partsRequest);
  assert.equal(result.status, "CANDIDATE");
  assert.equal(result.candidate.facets.mesh.type, "generated");
  assert.equal(result.candidate.facets.mesh.data.generator, "recipe");
  assert.deepEqual(result.candidate.facets.mesh.data.vars, {});

  const tile = MorphTile.createTile(result.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 3);
  assert.equal(compiled.T.length, 348, "bounded parts triangle receipt drifted");
  assert.equal(compiled.P.length, 348 * 9, "bounded parts position receipt drifted");
});

integrationTest("current pinned recipe compiler executes compact bounded repeats deterministically", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const request = {
    ...baseRequest,
    request_id: "runtime-repeat",
    intent: {
      name: "runtime repeat",
      repeat: {
        count: 4,
        step: [2, 1, 0],
        part: { shape: "plane", size: [1, 1, 1], pos: [0, 0, 0] }
      }
    }
  };

  const first = run(request), second = run(request);
  assert.equal(first.status, "CANDIDATE");
  assert.deepEqual(first, second);

  const tile = MorphTile.createTile(first.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, null);
  assert.equal(compiled.recipe_parts, 4);
  assert.equal(compiled.T.length, 8, "repeat recipe triangle receipt drifted");
  assert.equal(compiled.P.length, 8 * 9, "repeat recipe position receipt drifted");
});

integrationTest("current pinned runtime fails closed when the caller-recipe escape hatch loses finite numeric meaning", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const request = {
    ...baseRequest,
    request_id: "runtime-caller-recipe-nonfinite",
    intent: {
      name: "nonfinite caller recipe",
      recipe: [{
        shape: "plane",
        pos: [["*", Number.MAX_VALUE, 2], 0, 0]
      }]
    }
  };

  const out = run(request);
  assert.equal(out.status, "CANDIDATE", "Form Machine preserves the caller-owned recipe for runtime validation");
  assert.ok(out.warnings.some((warning) => warning.code === "CALLER_RECIPE_RUNTIME_VALIDATION_REQUIRED"));

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, "HOLD_RECIPE_NONFINITE_VALUE");
});

integrationTest("current pinned runtime fails closed when bounded Form primitive values overflow derived mesh coordinates", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const request = {
    ...baseRequest,
    request_id: "runtime-form-derived-nonfinite",
    intent: {
      name: "derived nonfinite Form primitive",
      shape: "box",
      size: [Number.MAX_VALUE, 1, 1],
      pos: [Number.MAX_VALUE, 0, 0]
    }
  };

  const out = run(request);
  assert.equal(out.status, "CANDIDATE", "finite authored Form values remain creation-valid before runtime mesh arithmetic");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, "HOLD_MESH_NONFINITE_VALUE");
  assert.deepEqual(compiled.P, []);
  assert.deepEqual(compiled.T, []);
  assert.deepEqual(compiled.K, []);
});

integrationTest("current pinned runtime keeps large finite bounded Form primitive values representable", () => {
  assert.equal(runtimeCommit, manifest.tested_against.commit, "CI runtime must match machine.json pin");
  const MorphTile = require(path.resolve(runtimePath));
  const request = {
    ...baseRequest,
    request_id: "runtime-form-large-finite",
    intent: {
      name: "large finite Form primitive",
      shape: "box",
      size: [1e150, 2e150, 3e150],
      pos: [1e150, -1e150, 1e150]
    }
  };

  const out = run(request);
  assert.equal(out.status, "CANDIDATE");

  const tile = MorphTile.createTile(out.candidate);
  const validity = MorphTile.validateTile(tile);
  assert.equal(validity.ok, true, validity.errors.join(", "));

  const compiled = MorphTile.compileMesh(tile);
  assert.equal(compiled.hold, null);
  assert.ok(compiled.P.length > 0);
  assert.ok(compiled.P.every((value) => Number.isFinite(value)));
});
