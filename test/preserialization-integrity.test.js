"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("../src");

function request(id, recipe) {
  return {
    envelope_version: "0.1",
    request_id: id,
    goal: "Preserve caller-authored geometry before Form transport",
    intent: {
      name: "Source integrity proof",
      recipe
    },
    provenance: { caller: "form-preserialization-integrity-test" }
  };
}

function findHold(out, code) {
  assert.equal(out.status, "HOLD");
  const found = out.holds.find((item) => item.code === code);
  assert.ok(found, JSON.stringify(out.holds));
  assert.equal(out.candidate, null);
  return found;
}

test("caller recipe accessor HOLDS without executing before candidate transport", () => {
  let calls = 0;
  const part = {};
  Object.defineProperty(part, "shape", {
    enumerable: true,
    get() {
      calls += 1;
      return "box";
    }
  });

  const out = run(request("form-accessor-source-integrity", [part]));
  const hold = findHold(out, "HOLD_FORM_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "Form must inspect authored recipe descriptors without invoking getters");
  assert.equal(hold.path, "request.intent.recipe[0].shape");
});

test("caller recipe toJSON HOLDS without invoking the hook or rewriting geometry", () => {
  let calls = 0;
  const part = { shape: "box", size: [1, 1, 1] };
  part.toJSON = function toJSON() {
    calls += 1;
    return { shape: "plane", size: [99, 99, 99] };
  };

  const out = run(request("form-tojson-source-integrity", [part]));
  const hold = findHold(out, "HOLD_FORM_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "Form must never invoke caller-controlled toJSON while preserving authored geometry");
  assert.equal(hold.path, "request.intent.recipe[0].toJSON");
});

test("caller Proxy HOLDS before descriptor inspection can execute Proxy traps", () => {
  let calls = 0;
  const part = new Proxy(
    { shape: "box", size: [1, 1, 1] },
    {
      getPrototypeOf() {
        calls += 1;
        throw new Error("proxy getPrototypeOf trap executed");
      },
      ownKeys() {
        calls += 1;
        throw new Error("proxy ownKeys trap executed");
      },
      getOwnPropertyDescriptor() {
        calls += 1;
        throw new Error("proxy getOwnPropertyDescriptor trap executed");
      }
    }
  );

  const out = run(request("form-proxy-source-integrity", [part]));
  const hold = findHold(out, "HOLD_FORM_INPUT_NONPORTABLE_VALUE");
  assert.equal(calls, 0, "Form must reject caller Proxy values before any Proxy trap can execute");
  assert.equal(hold.path, "request.intent.recipe[0]");
});

test("non-finite caller recipe values HOLD instead of becoming null during result cloning", () => {
  const out = run(request("form-nonfinite-source-integrity", [
    { shape: "box", pos: [Number.POSITIVE_INFINITY, 0, 0] }
  ]));
  const hold = findHold(out, "HOLD_FORM_INPUT_NONFINITE_VALUE");
  assert.equal(hold.path, "request.intent.recipe[0].pos[0]");
});

test("ordinary portable caller recipe remains unchanged and does not mutate source input", () => {
  const input = request("form-portable-source-control", [
    { shape: "box", size: [2, 3, 4], pos: [1, 2, 3] }
  ]);
  const before = JSON.parse(JSON.stringify(input));

  const out = run(input);
  assert.equal(out.status, "CANDIDATE", JSON.stringify(out.holds));
  assert.deepEqual(input, before);
  assert.deepEqual(out.candidate.facets.mesh.data.parts, before.intent.recipe);
});
