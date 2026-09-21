"use strict";

const { linearValue, linearExpression, proveFiniteRepeat } = require("./repeat-progression");

const PRIMITIVES = Object.freeze(["box", "sphere", "cylinder", "cone", "wedge", "plane"]);
const RADIAL = new Set(["sphere", "cylinder", "cone"]);
const PART_KEYS = new Set(["shape", "size", "pos", "rot", "segments", "taper", "sub"]);
const INSTANCE_KEYS = new Set(["use", "with", "pos", "rot", "scale"]);
const INTENT_KEYS = Object.freeze({
  primitive: new Set(["name", ...PART_KEYS]),
  recipe: new Set(["name", "recipe", "vars"]),
  parts: new Set(["name", "parts"]),
  repeat: new Set(["name", "repeat"]),
  grid: new Set(["name", "grid"]),
  instances: new Set(["name", "instances"])
});
const REPEAT_KEYS = new Set(["count", "step", "part", "instance", "with_step"]);
const GRID_KEYS = new Set(["counts", "step", "part", "instance"]);
const MAX_FLAT_PARTS = 64;
const MAX_REPEAT_COUNT = 64;
const MAX_GRID_INSTANCES = 64;
const MAX_DEFINITION_INSTANCES = 64;
const MAX_INSTANCE_SETTINGS = 32;
const SETTING_NAME = /^[A-Za-z_][A-Za-z0-9_.-]{0,63}$/;

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function validateIntentObject(intent) {
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) {
    return hold("HOLD_FORM_INTENT_INVALID", "intent must be an object");
  }
  return { ok: true };
}

function validateIntentKeys(intent, mode) {
  const valid = validateIntentObject(intent);
  if (!valid.ok) return valid;
  const allowed = INTENT_KEYS[mode];
  if (!allowed) return hold("HOLD_FORM_INTENT_INVALID", `unknown form mode: ${String(mode)}`);
  const unknown = Object.keys(intent).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `intent.${mode} has unsupported field(s): ${unknown.join(", ")}`);
  }
  return { ok: true };
}

function vec3(value, name, { positive = false, fallback } = {}) {
  if (value === undefined) return { ok: true, value: fallback };
  if (!Array.isArray(value) || value.length !== 3 || value.some((x) => typeof x !== "number" || !Number.isFinite(x))) {
    return hold("HOLD_FORM_PARAMETER_INVALID", `${name} must be three finite numbers`);
  }
  if (positive && value.some((x) => x <= 0)) {
    return hold("HOLD_FORM_PARAMETER_INVALID", `${name} values must be greater than zero`);
  }
  return { ok: true, value: value.slice() };
}

function boundedInteger(value, name, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    return hold("HOLD_FORM_PARAMETER_INVALID", `${name} must be an integer from ${min} to ${max}`);
  }
  return { ok: true, value };
}

function finiteLinearProgression(base, delta, count, name, holdCode) {
  for (let index = 0; index < count; index++) {
    if (!Number.isFinite(base + index * delta)) {
      return hold(holdCode, `${name} produces a non-finite generated value at index ${index}`);
    }
  }
  return { ok: true };
}

function finiteRepeatProgression(base, delta, count, name) {
  const proof = proveFiniteRepeat(count, (index) => [linearValue(base, index, delta)]);
  if (!proof.ok) {
    return hold("HOLD_FORM_REPEAT_INVALID", `${name} produces a non-finite generated value at index ${proof.index}`);
  }
  return { ok: true };
}

function normalizePrimitiveIntent(intent = {}) {
  const shape = intent.shape;
  if (!PRIMITIVES.includes(shape)) {
    return hold("HOLD_FORM_VOCABULARY_MISSING", `Unsupported named form: ${String(shape || "unspecified")}`);
  }

  const size = vec3(intent.size, "size", { positive: true, fallback: [1, 1, 1] });
  if (!size.ok) return size;
  const pos = vec3(intent.pos, "pos", { fallback: undefined });
  if (!pos.ok) return pos;
  const rot = vec3(intent.rot, "rot", { fallback: undefined });
  if (!rot.ok) return rot;

  const data = { shape, size: size.value };
  if (pos.value !== undefined) data.pos = pos.value;
  if (rot.value !== undefined) data.rot = rot.value;

  if (intent.segments !== undefined) {
    if (!RADIAL.has(shape)) return hold("HOLD_FORM_PARAMETER_INVALID", "segments is only valid for sphere, cylinder, or cone");
    const segments = boundedInteger(intent.segments, "segments", 3, 128);
    if (!segments.ok) return segments;
    data.segments = segments.value;
  }

  if (intent.taper !== undefined) {
    if (shape !== "cylinder") return hold("HOLD_FORM_PARAMETER_INVALID", "taper is only valid for cylinder");
    if (typeof intent.taper !== "number" || !Number.isFinite(intent.taper) || intent.taper <= 0) {
      return hold("HOLD_FORM_PARAMETER_INVALID", "taper must be a finite number greater than zero");
    }
    data.taper = intent.taper;
  }

  if (intent.sub !== undefined) {
    if (shape !== "box") return hold("HOLD_FORM_PARAMETER_INVALID", "sub is only valid for box");
    const sub = boundedInteger(intent.sub, "sub", 1, 64);
    if (!sub.ok) return sub;
    data.sub = sub.value;
  }

  return { ok: true, data };
}

function partLabel(index) {
  return Number.isInteger(index) ? `parts[${index}]` : String(index || "part");
}

function normalizePrimitivePart(part, index) {
  const label = partLabel(index);
  if (!part || typeof part !== "object" || Array.isArray(part)) {
    return hold("HOLD_FORM_COMPOSITION_INVALID", `${label} must be an object`);
  }

  const unknown = Object.keys(part).filter((key) => !PART_KEYS.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `${label} has unsupported field(s): ${unknown.join(", ")}`);
  }

  const normalized = normalizePrimitiveIntent(part);
  if (!normalized.ok) {
    return hold(normalized.hold.code, `${label}: ${normalized.hold.detail}`);
  }
  return normalized;
}

function normalizePrimitiveParts(parts) {
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > MAX_FLAT_PARTS) {
    return hold("HOLD_FORM_COMPOSITION_INVALID", `parts must contain 1 to ${MAX_FLAT_PARTS} primitive parts`);
  }

  const normalized = [];
  for (let i = 0; i < parts.length; i++) {
    const part = normalizePrimitivePart(parts[i], i);
    if (!part.ok) return part;
    normalized.push(part.data);
  }
  return { ok: true, data: normalized };
}

function instanceLabel(index) {
  return Number.isInteger(index) ? `instances[${index}]` : String(index || "instance");
}

function normalizeDefinitionInstance(instance, index) {
  const label = instanceLabel(index);
  if (!instance || typeof instance !== "object" || Array.isArray(instance)) {
    return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `${label} must be an object`);
  }

  const unknown = Object.keys(instance).filter((key) => !INSTANCE_KEYS.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `${label} has unsupported field(s): ${unknown.join(", ")}`);
  }

  if (typeof instance.use !== "string" || !/^[A-Za-z0-9_.-]{1,128}$/.test(instance.use)) {
    return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `${label}.use must be a non-empty definition id using A-Z, a-z, 0-9, _, ., or -`);
  }

  const data = { use: instance.use };

  if (instance.with !== undefined) {
    if (!instance.with || typeof instance.with !== "object" || Array.isArray(instance.with)) {
      return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `${label}.with must be an object of finite numeric settings`);
    }
    const keys = Object.keys(instance.with).sort();
    if (keys.length > MAX_INSTANCE_SETTINGS) {
      return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `${label}.with may contain at most ${MAX_INSTANCE_SETTINGS} settings`);
    }
    const settings = Object.create(null);
    for (const key of keys) {
      if (!SETTING_NAME.test(key)) {
        return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `${label}.with contains invalid setting name: ${key}`);
      }
      const value = instance.with[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `${label}.with.${key} must be a finite number`);
      }
      settings[key] = value;
    }
    if (keys.length) data.with = settings;
  }

  const pos = vec3(instance.pos, `${label}.pos`, { fallback: undefined });
  if (!pos.ok) return pos;
  if (pos.value !== undefined) data.pos = pos.value;

  const rot = vec3(instance.rot, `${label}.rot`, { fallback: undefined });
  if (!rot.ok) return rot;
  if (rot.value !== undefined) data.rot = rot.value;

  if (instance.scale !== undefined) {
    if (typeof instance.scale === "number") {
      if (!Number.isFinite(instance.scale) || instance.scale <= 0) {
        return hold("HOLD_FORM_PARAMETER_INVALID", `${label}.scale must be a finite number greater than zero`);
      }
      data.scale = instance.scale;
    } else {
      const scale = vec3(instance.scale, `${label}.scale`, { positive: true });
      if (!scale.ok) return scale;
      data.scale = scale.value;
    }
  }

  return { ok: true, data };
}

function normalizeDefinitionInstances(instances) {
  if (!Array.isArray(instances) || instances.length < 1 || instances.length > MAX_DEFINITION_INSTANCES) {
    return hold("HOLD_FORM_DEFINITION_INSTANCE_INVALID", `instances must contain 1 to ${MAX_DEFINITION_INSTANCES} definition references`);
  }

  const normalized = [];
  for (let i = 0; i < instances.length; i++) {
    const item = normalizeDefinitionInstance(instances[i], i);
    if (!item.ok) return item;
    normalized.push(item.data);
  }
  return { ok: true, data: normalized };
}

function normalizeRepeatSettingStep(withStep, target, count) {
  if (!withStep || typeof withStep !== "object" || Array.isArray(withStep)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.with_step must be an object of finite numeric deltas");
  }

  const keys = Object.keys(withStep).sort();
  if (keys.length < 1 || keys.length > MAX_INSTANCE_SETTINGS) {
    return hold("HOLD_FORM_REPEAT_INVALID", `repeat.with_step must contain 1 to ${MAX_INSTANCE_SETTINGS} setting deltas`);
  }

  const baseSettings = target.with || {};
  const stepped = { ...baseSettings };
  let changesSetting = false;

  for (const key of keys) {
    if (!SETTING_NAME.test(key)) {
      return hold("HOLD_FORM_REPEAT_INVALID", `repeat.with_step contains invalid setting name: ${key}`);
    }
    if (!Object.prototype.hasOwnProperty.call(baseSettings, key)) {
      return hold("HOLD_FORM_REPEAT_INVALID", `repeat.with_step.${key} requires a matching finite numeric instance.with.${key} base`);
    }
    const delta = withStep[key];
    if (typeof delta !== "number" || !Number.isFinite(delta)) {
      return hold("HOLD_FORM_REPEAT_INVALID", `repeat.with_step.${key} must be a finite number`);
    }
    const closure = finiteRepeatProgression(baseSettings[key], delta, count, `repeat.with_step.${key}`);
    if (!closure.ok) return closure;
    changesSetting ||= delta !== 0;
    stepped[key] = linearExpression(baseSettings[key], delta);
  }

  if (!changesSetting) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.with_step must change at least one setting");
  }

  return { ok: true, data: stepped };
}

function normalizePrimitiveRepeat(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat must be an object");
  }

  const unknown = Object.keys(repeat).filter((key) => !REPEAT_KEYS.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `repeat has unsupported field(s): ${unknown.join(", ")}`);
  }

  const count = boundedInteger(repeat.count, "repeat.count", 1, MAX_REPEAT_COUNT);
  if (!count.ok) return count;

  if (repeat.step === undefined) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.step is required");
  }
  const step = vec3(repeat.step, "repeat.step");
  if (!step.ok) return step;
  if (step.value.every((x) => x === 0)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.step must move at least one axis; zero-step duplicates identical geometry");
  }

  const targetModes = ["part", "instance"].filter((key) => repeat[key] !== undefined);
  if (targetModes.length !== 1) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat must provide exactly one target: part or instance");
  }

  const target = targetModes[0] === "part"
    ? normalizePrimitivePart(repeat.part, "repeat.part")
    : normalizeDefinitionInstance(repeat.instance, "repeat.instance");
  if (!target.ok) return target;

  const basePos = target.data.pos || [0, 0, 0];
  for (let axis = 0; axis < 3; axis++) {
    const closure = finiteRepeatProgression(
      basePos[axis],
      step.value[axis],
      count.value,
      `repeat position axis ${axis}`
    );
    if (!closure.ok) return closure;
  }

  const repeatedTarget = { ...target.data };
  repeatedTarget.pos = basePos.map((base, axis) => linearExpression(base, step.value[axis]));

  if (repeat.with_step !== undefined) {
    if (targetModes[0] !== "instance") {
      return hold("HOLD_FORM_REPEAT_INVALID", "repeat.with_step is only valid for a definition instance target");
    }
    const steppedSettings = normalizeRepeatSettingStep(repeat.with_step, target.data, count.value);
    if (!steppedSettings.ok) return steppedSettings;
    repeatedTarget.with = steppedSettings.data;
  }

  return {
    ok: true,
    data: {
      repeat: count.value,
      as: "i",
      body: [repeatedTarget]
    },
    target_kind: targetModes[0]
  };
}

function normalizeGrid(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid)) {
    return hold("HOLD_FORM_GRID_INVALID", "grid must be an object");
  }

  const unknown = Object.keys(grid).filter((key) => !GRID_KEYS.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `grid has unsupported field(s): ${unknown.join(", ")}`);
  }

  if (!Array.isArray(grid.counts) || grid.counts.length !== 3) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.counts must be three integers");
  }
  const counts = [];
  for (let axis = 0; axis < 3; axis++) {
    const count = boundedInteger(grid.counts[axis], `grid.counts[${axis}]`, 1, MAX_GRID_INSTANCES);
    if (!count.ok) return hold("HOLD_FORM_GRID_INVALID", count.hold.detail);
    counts.push(count.value);
  }

  const totalInstances = counts[0] * counts[1] * counts[2];
  if (totalInstances < 2 || totalInstances > MAX_GRID_INSTANCES) {
    return hold("HOLD_FORM_GRID_INVALID", `grid must create 2 to ${MAX_GRID_INSTANCES} total instances`);
  }

  if (grid.step === undefined) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.step is required");
  }
  const step = vec3(grid.step, "grid.step");
  if (!step.ok) return hold("HOLD_FORM_GRID_INVALID", step.hold.detail);
  for (let axis = 0; axis < 3; axis++) {
    if (counts[axis] > 1 && step.value[axis] === 0) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.step[${axis}] must be non-zero when grid.counts[${axis}] is greater than one`);
    }
  }

  const targetModes = ["part", "instance"].filter((key) => grid[key] !== undefined);
  if (targetModes.length !== 1) {
    return hold("HOLD_FORM_GRID_INVALID", "grid must provide exactly one target: part or instance");
  }

  const target = targetModes[0] === "part"
    ? normalizePrimitivePart(grid.part, "grid.part")
    : normalizeDefinitionInstance(grid.instance, "grid.instance");
  if (!target.ok) return target;

  const basePos = target.data.pos || [0, 0, 0];
  for (let axis = 0; axis < 3; axis++) {
    const closure = finiteLinearProgression(
      basePos[axis],
      step.value[axis],
      counts[axis],
      `grid position axis ${axis}`,
      "HOLD_FORM_GRID_INVALID"
    );
    if (!closure.ok) return closure;
  }

  const axisVars = ["gx", "gy", "gz"];
  const gridTarget = { ...target.data };
  gridTarget.pos = basePos.map((base, axis) => {
    if (counts[axis] === 1) return base;
    return ["+", base, ["*", ["var", axisVars[axis]], step.value[axis]]];
  });

  let body = [gridTarget];
  for (let axis = 2; axis >= 0; axis--) {
    if (counts[axis] === 1) continue;
    body = [{ repeat: counts[axis], as: axisVars[axis], body }];
  }

  return {
    ok: true,
    data: body[0],
    target_kind: targetModes[0],
    total_instances: totalInstances
  };
}

module.exports = {
  PRIMITIVES,
  MAX_FLAT_PARTS,
  MAX_REPEAT_COUNT,
  MAX_GRID_INSTANCES,
  MAX_DEFINITION_INSTANCES,
  MAX_INSTANCE_SETTINGS,
  validateIntentObject,
  validateIntentKeys,
  normalizePrimitiveIntent,
  normalizePrimitiveParts,
  normalizePrimitiveRepeat,
  normalizeGrid,
  normalizeDefinitionInstances
};