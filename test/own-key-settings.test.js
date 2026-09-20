const test = require("node:test");
const assert = require("node:assert/strict");

const base = require("../fixtures/request.box.json");
const { run } = require("../src");

function authoredSettings() {
  return JSON.parse('{"__proto__":7,"constructor":8,"toString":9}');
}

test("definition-instance settings preserve exact authored own-key identity", () => {
  const input = {
    ...base,
    request_id: "definition-own-key-settings",
    intent: {
      name: "definition own-key settings",
      instances: [{ use: "panel", with: authoredSettings() }]
    }
  };

  const before = JSON.stringify(input);
  const out = run(input);

  assert.equal(out.status, "CANDIDATE");
  assert.equal(JSON.stringify(input), before, "Form must not mutate caller-owned settings");

  const settings = out.candidate.facets.mesh.data.parts[0].with;
  for (const [key, value] of [["__proto__", 7], ["constructor", 8], ["toString", 9]]) {
    assert.equal(Object.prototype.hasOwnProperty.call(settings, key), true, `${key} must remain an own authored setting`);
    assert.equal(settings[key], value, `${key} must preserve its authored numeric value`);
  }
});
