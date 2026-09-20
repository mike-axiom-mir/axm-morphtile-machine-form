"use strict";

const { normalizeRepeatWithSize } = require("./repeat-size");

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeScaleStep(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step must be one finite number");
  }
  if (value === 0) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step must change scale");
  }
  return { ok: true, value };
}

function positiveFiniteScaleProgression(base, delta, count) {
  for (let index = 0; index < count; index += 1) {
    const value = base + index * delta;
    if (!Number.isFinite(value)) {
      return hold(
        "HOLD_FORM_REPEAT_INVALID",
        `repeat scale produces a non-finite generated value at index ${index}`
      );
    }
    if (value <= 0) {
      return hold(
        "HOLD_FORM_REPEAT_INVALID",
        `repeat scale must stay positive across the complete repeat domain; index ${index} produced ${value}`
      );
    }
  }
  return { ok: true };
}

function normalizeRepeatWithScale(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat) || repeat.scale_step === undefined) {
    return normalizeRepeatWithSize(repeat);
  }

  const scaleStep = normalizeScaleStep(repeat.scale_step);
  if (!scaleStep.ok) return scaleStep;

  const legacyRepeat = { ...repeat };
  delete legacyRepeat.scale_step;
  const normalized = normalizeRepeatWithSize(legacyRepeat);
  if (!normalized.ok) return normalized;

  if (normalized.target_kind !== "instance") {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step is only available for definition-instance repeats; primitive repeats use size_step");
  }
  if (normalized.data.repeat < 2) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step requires repeat.count of at least 2 so scale can progress");
  }

  const repeatedTarget = normalized.data.body[0];
  if (Array.isArray(repeatedTarget.scale)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step currently requires scalar instance.scale; vector scale progression remains held");
  }
  const baseScale = repeatedTarget.scale === undefined ? 1 : repeatedTarget.scale;
  const closure = positiveFiniteScaleProgression(baseScale, scaleStep.value, normalized.data.repeat);
  if (!closure.ok) return closure;

  repeatedTarget.scale = ["+", baseScale, ["*", ["var", "i"], scaleStep.value]];
  return normalized;
}

module.exports = { normalizeRepeatWithScale };
