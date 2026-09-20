"use strict";

const { assertRequest, result } = require("./envelope");
const {
  validateIntentObject,
  validateIntentKeys,
  normalizePrimitiveIntent,
  normalizePrimitiveParts,
  normalizePrimitiveRepeat,
  normalizeGrid,
  normalizeDefinitionInstances
} = require("./form-vocabulary");
const {
  validateComposeIntentKeys,
  normalizeMixedComposition
} = require("./mixed-composition");
const MACHINE = { id: "axm.morphtile.machine.form", version: "0.9.0" };

function holdResult(request, hold, suggested_missing_capability = null) {
  return result(request, MACHINE, "HOLD", {
    holds: [hold],
    suggested_missing_capability
  });
}

function run(request) {
  assertRequest(request);
  const intent = request.intent === undefined ? {} : request.intent;
  const validIntent = validateIntentObject(intent);
  if (!validIntent.ok) return holdResult(request, validIntent.hold);

  const compositionModes = ["recipe", "parts", "compose", "repeat", "grid", "instances"].filter((key) => intent[key] !== undefined);

  if (compositionModes.length > 1) {
    return holdResult(request, {
      code: "HOLD_FORM_COMPOSITION_AMBIGUOUS",
      detail: `Provide only one composition mode: ${compositionModes.join(", ")}`
    });
  }

  const mode = compositionModes[0] || "primitive";
  const keys = mode === "compose" ? validateComposeIntentKeys(intent) : validateIntentKeys(intent, mode);
  if (!keys.ok) return holdResult(request, keys.hold);

  let mesh;
  let check;
  const warnings = [{ code: "NOT_VISUALLY_VERIFIED" }];
  if (mode === "recipe") {
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: intent.vars || {}, parts: intent.recipe } };
    check = "caller recipe mapped to a MorphTile generated mesh facet";
    warnings.push({ code: "CALLER_RECIPE_RUNTIME_VALIDATION_REQUIRED" });
  } else if (mode === "parts") {
    const parts = normalizePrimitiveParts(intent.parts);
    if (!parts.ok) return holdResult(request, parts.hold);
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: {}, parts: parts.data } };
    check = `bounded flat primitive composition normalized into a MorphTile recipe (${parts.data.length} parts)`;
  } else if (mode === "compose") {
    const composed = normalizeMixedComposition(intent.compose);
    if (!composed.ok) return holdResult(request, composed.hold);
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: {}, parts: composed.data } };
    check = `bounded direct/pattern composition normalized into one MorphTile recipe (${composed.data.length} blocks / ${composed.placement_count} requested placements)`;
    if (composed.has_definitions) warnings.push({ code: "DEFINITION_RUNTIME_RESOLUTION_REQUIRED" });
  } else if (mode === "repeat") {
    const repeated = normalizePrimitiveRepeat(intent.repeat);
    if (!repeated.ok) return holdResult(request, repeated.hold);
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: {}, parts: [repeated.data] } };
    check = `bounded ${repeated.target_kind === "instance" ? "definition-instance" : "primitive"} repeat normalized into a compact MorphTile recipe (${repeated.data.repeat} instances)`;
    if (repeated.target_kind === "instance") warnings.push({ code: "DEFINITION_RUNTIME_RESOLUTION_REQUIRED" });
  } else if (mode === "grid") {
    const grid = normalizeGrid(intent.grid);
    if (!grid.ok) return holdResult(request, grid.hold);
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: {}, parts: [grid.data] } };
    check = `bounded ${grid.target_kind === "instance" ? "definition-instance" : "primitive"} grid normalized into compact MorphTile recipe loops (${grid.total_instances} instances)`;
    if (grid.target_kind === "instance") warnings.push({ code: "DEFINITION_RUNTIME_RESOLUTION_REQUIRED" });
  } else if (mode === "instances") {
    const instances = normalizeDefinitionInstances(intent.instances);
    if (!instances.ok) return holdResult(request, instances.hold);
    mesh = { type: "generated", source: null, data: { generator: "recipe", vars: {}, parts: instances.data } };
    check = `bounded definition-instance composition normalized into MorphTile recipe uses (${instances.data.length} instances)`;
    warnings.push({ code: "DEFINITION_RUNTIME_RESOLUTION_REQUIRED" });
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
    warnings
  });
}

module.exports = { MACHINE, run };
