"use strict";

const PRIMITIVES = Object.freeze(["box", "sphere", "cylinder", "cone", "wedge", "plane"]);
const RADIAL = new Set(["sphere", "cylinder", "cone"]);
const PART_KEYS = new Set(["shape", "size", "pos", "rot", "segments", "taper", "sub"]);
const REPEAT_KEYS = new Set(["count", "step", "part"]);
const MAX_FLAT_PARTS = 64;
const MAX_REPEAT_COUNT = 64;

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
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

function normalizePrimitivePart(part, index) {
  if (!part || typeof part !== "object" || Array.isArray(part)) {
    return hold("HOLD_FORM_COMPOSITION_INVALID", `parts[${index}] must be an object`);
  }

  const unknown = Object.keys(part).filter((key) => !PART_KEYS.has(key)).sort();
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `parts[${index}] has unsupported field(s): ${unknown.join(", ")}`);
  }

  const normalized = normalizePrimitiveIntent(part);
  if (!normalized.ok) {
    return hold(normalized.hold.code, `parts[${index}]: ${normalized.hold.detail}`);
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

  const step = vec3(repeat.step, "repeat.step");
  if (!step.ok) return step;
  if (step.value.every((x) => x === 0)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.step must move at least one axis; zero-step duplicates identical geometry");
  }

  const part = normalizePrimitivePart(repeat.part, "repeat.part");
  if (!part.ok) return part;

  const basePos = part.data.pos || [0, 0, 0];
  const repeatedPart = { ...part.data };
  repeatedPart.pos = basePos.map((base, axis) => {
    const delta = step.value[axis];
    return delta === 0 ? base : ["+", base, ["*", ["var", "i"], delta]];
  });

  return {
    ok: true,
    data: {
      repeat: count.value,
      as: "i",
      body: [repeatedPart]
    }
  };
}

module.exports = {
  PRIMITIVES,
  MAX_FLAT_PARTS,
  MAX_REPEAT_COUNT,
  normalizePrimitiveIntent,
  normalizePrimitiveParts,
  normalizePrimitiveRepeat
};
