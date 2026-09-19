"use strict";

const { assertRequest, result } = require("./envelope");
const MACHINE = { id: "axm.morphtile.machine.form", version: "0.1.0" };

function run(request) {
  assertRequest(request);
  const intent = request.intent || {};
  if (intent.shape !== "box" && !intent.recipe) {
    return result(request, MACHINE, "HOLD", {
      holds: [{ code: "HOLD_FORM_VOCABULARY_MISSING", detail: "Supply a MorphTile recipe or the supported box proof." }],
      suggested_missing_capability: "form:" + String(intent.shape || "unspecified")
    });
  }
  const mesh = intent.recipe
    ? { type: "generated", source: null, data: { generator: "recipe", vars: intent.vars || {}, parts: intent.recipe } }
    : { type: "primitive", source: null, data: { shape: "box", size: intent.size || [1, 1, 1] } };
  return result(request, MACHINE, "CANDIDATE", {
    candidate: { schema: "morphtile.tile-spec/v0.4", name: intent.name || "Form candidate", form_hints: ["game_asset"], facets: { mesh } },
    evidence: [{ kind: "STRUCTURAL", status: "PASS", check: "bounded form mapped to a MorphTile mesh facet" }],
    warnings: [{ code: "NOT_VISUALLY_VERIFIED" }]
  });
}

module.exports = { MACHINE, run };
