"use strict";

const { assertRequest, result } = require("./envelope");
const { normalizePrimitiveIntent, normalizePrimitiveParts } = require("./form-vocabulary");
const MACHINE = { id: "axm.morphtile.machine.form", version: "0.3.0" };

function holdResult(request, hold, suggested_missing_capability = null) {
  return result(request, MACHINE, "HOLD", {
    holds: [hold],
    suggested_missing_capability
  });
}

function run(request) {
  assertRequest(request);
  const intent = request.intent || {};

  if (intent.recipe !== undefined && intent.parts !== undefined) {
    return holdResult(request, {
      code: "HOLD_FORM_COMPOSITION_AMBIGUOUS",
      detail: "Provide either recipe or parts, not both"
    });
  }

  let mesh;
  let check;
  if (intent.recipe !== undefined) {
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: intent.vars || {}, parts: intent.recipe } };
    check = "caller recipe mapped to a MorphTile generated mesh facet";
  } else if (intent.parts !== undefined) {
    const parts = normalizePrimitiveParts(intent.parts);
    if (!parts.ok) return holdResult(request, parts.hold);
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: {}, parts: parts.data } };
    check = `bounded flat primitive composition normalized into a MorphTile recipe (${parts.data.length} parts)`;
  } else {
    const primitive = normalizePrimitiveIntent(intent);
    if (!primitive.ok) {
      return holdResult(
        request,
        primitive.hold,
        primitive.hold.code === "HOLD_FORM_VOCABULARY_MISSING"
          ? "form:" + String(intent.shape || "unspecified")
          : null
      );
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
