"use strict";

const PRIMITIVES = Object.freeze(["box", "sphere", "cylinder", "cone", "wedge", "plane"]);
const RADIAL = new Set(["sphere", "cylinder", "cone"]);

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

module.exports = { PRIMITIVES, normalizePrimitiveIntent };
