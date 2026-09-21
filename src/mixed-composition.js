"use strict";

const {
  normalizePrimitiveParts,
  normalizeDefinitionInstances
} = require("./form-vocabulary");
const { normalizeRepeatWithDistinctness } = require("./repeat-distinctness");
const { normalizeGridWithDistinctness } = require("./grid-distinctness");

const COMPOSE_ITEM_KEYS = new Set(["part", "instance", "repeat", "grid"]);
const COMPOSE_INTENT_KEYS = new Set(["name", "compose"]);
const MAX_COMPOSE_ITEMS = 64;
const MAX_COMPOSE_PLACEMENTS = 64;

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function validateComposeIntentKeys(intent) {
  const unknown = Object.keys(intent).filter((key) => !COMPOSE_INTENT_KEYS.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `intent.compose has unsupported field(s): ${unknown.join(", ")}`);
  }
  return { ok: true };
}

function normalizeMixedComposition(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > MAX_COMPOSE_ITEMS) {
    return hold("HOLD_FORM_COMPOSITION_INVALID", `compose must contain 1 to ${MAX_COMPOSE_ITEMS} items`);
  }
  const normalized = [];
  let hasDefinitions = false;
  let placementCount = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = `compose[${i}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return hold("HOLD_FORM_COMPOSITION_INVALID", `${label} must be an object`);
    }
    const unknown = Object.keys(item).filter((key) => !COMPOSE_ITEM_KEYS.has(key)).sort();
    if (unknown.length) {
      return hold("HOLD_FORM_PARAMETER_UNKNOWN", `${label} has unsupported field(s): ${unknown.join(", ")}`);
    }
    const modes = ["part", "instance", "repeat", "grid"].filter((key) => item[key] !== undefined);
    if (modes.length !== 1) {
      return hold("HOLD_FORM_COMPOSITION_INVALID", `${label} must provide exactly one target: part, instance, repeat, or grid`);
    }
    const mode = modes[0];
    let data;
    let placements = 1;
    let usesDefinition = false;
    if (mode === "part") {
      const part = normalizePrimitiveParts([item.part]);
      if (!part.ok) return hold(part.hold.code, `${label}.part: ${part.hold.detail}`);
      data = part.data[0];
    } else if (mode === "instance") {
      const instance = normalizeDefinitionInstances([item.instance]);
      if (!instance.ok) return hold(instance.hold.code, `${label}.instance: ${instance.hold.detail}`);
      data = instance.data[0];
      usesDefinition = true;
    } else if (mode === "repeat") {
      const repeated = normalizeRepeatWithDistinctness(item.repeat);
      if (!repeated.ok) return hold(repeated.hold.code, `${label}.repeat: ${repeated.hold.detail}`);
      data = repeated.data;
      placements = repeated.data.repeat;
      usesDefinition = repeated.target_kind === "instance";
    } else {
      const grid = normalizeGridWithDistinctness(item.grid);
      if (!grid.ok) return hold(grid.hold.code, `${label}.grid: ${grid.hold.detail}`);
      data = grid.data;
      placements = grid.total_instances;
      usesDefinition = grid.target_kind === "instance";
    }
    if (placementCount + placements > MAX_COMPOSE_PLACEMENTS) {
      return hold(
        "HOLD_FORM_COMPOSITION_INVALID",
        `compose may request at most ${MAX_COMPOSE_PLACEMENTS} placements across direct, repeat, and grid items`
      );
    }
    normalized.push(data);
    placementCount += placements;
    hasDefinitions ||= usesDefinition;
  }
  return {
    ok: true,
    data: normalized,
    has_definitions: hasDefinitions,
    placement_count: placementCount
  };
}

module.exports = {
  MAX_COMPOSE_ITEMS,
  MAX_COMPOSE_PLACEMENTS,
  validateComposeIntentKeys,
  normalizeMixedComposition
};
