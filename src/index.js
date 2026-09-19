"use strict";

const { assertRequest, result } = require("./envelope");
const { normalizePrimitiveIntent } = require("./form-vocabulary");
const MACHINE = { id: "axm.morphtile.machine.form", version: "0.2.0" };

function run(request) {
  assertRequest(request);
  const intent = request.intent || {};

  let mesh;
  let check;
  if (intent.recipe) {
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: intent.vars || {}, parts: intent.recipe } };
    check = "caller recipe mapped to a MorphTile generated mesh facet";
  } else {
    const primitive = normalizePrimitiveIntent(intent);
    if (!primitive.ok) {
      return result(request, MACHINE, "HOLD", {
        holds: [primitive.hold],
        suggested_missing_capability: primitive.hold.code === "HOLD_FORM_VOCABULARY_MISSING"
          ? "form:" + String(intent.shape || "unspecified")
          : null
      });
    }
    mesh = { type: "primitive", source: null, data: primitive.data };
    check = "bounded named primitive mapped to an explicit MorphTile primitive mesh facet";
  }

  return result(request, MACHINE, "CANDIDATE", {
    candidate: {
      schema: "morphtile.tile-spec/v0.4",
      name: intent.name || "Form candidate",
      form_hints: ["game_asset"],
      facets: { mesh }
    },
    evidence: [{ kind: "STRUCTURAL", status: "PASS", check }],
    warnings: [{ code: "NOT_VISUALLY_VERIFIED" }]
  });
}

module.exports = { MACHINE, run };
