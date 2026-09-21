"use strict";

const { normalizeRepeatWithSize } = require("./repeat-size");
const { linearExpression, linearVectorExpression, proveFiniteLinear } = require("./repeat-progression");

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeScaleStep(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step scalar must be finite");
    }
    if (value === 0) {
      return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step must change scale");
    }
    return { ok: true, kind: "scalar", value };
  }

  if (!Array.isArray(value) || value.length !== 3 || value.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step must be one finite number or three finite per-axis numbers");
  }
  if (value.every((item) => item === 0)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.scale_step must change scale on at least one axis");
  }
  return { ok: true, kind: "vector", value: value.slice() };
}

function positiveFiniteScaleProgression(base, delta, count, name = "repeat scale") {
  const proof = proveFiniteLinear(
    count,
    base,
    delta,
    (value) => value <= 0 ? { value } : null
  );
  if (!proof.ok) {
    if (proof.reason === "nonfinite") {
      return hold(
        "HOLD_FORM_REPEAT_INVALID",
        `${name} produces a non-finite generated value at index ${proof.index}`
      );
    }
    return hold(
      "HOLD_FORM_REPEAT_INVALID",
      `${name} must stay positive across the complete repeat domain; index ${proof.index} produced ${proof.detail.value}`
    );
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
  if (scaleStep.kind === "scalar") {
    if (Array.isArray(repeatedTarget.scale)) {
      return hold("HOLD_FORM_REPEAT_INVALID", "scalar repeat.scale_step requires scalar instance.scale or omitted unit scale");
    }
    const baseScale = repeatedTarget.scale === undefined ? 1 : repeatedTarget.scale;
    const closure = positiveFiniteScaleProgression(baseScale, scaleStep.value, normalized.data.repeat);
    if (!closure.ok) return closure;
    repeatedTarget.scale = linearExpression(baseScale, scaleStep.value);
    return normalized;
  }

  if (repeatedTarget.scale !== undefined && !Array.isArray(repeatedTarget.scale)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "vector repeat.scale_step requires vector instance.scale or omitted unit scale");
  }
  const baseScale = repeatedTarget.scale === undefined ? [1, 1, 1] : repeatedTarget.scale.slice();
  for (let axis = 0; axis < 3; axis += 1) {
    const closure = positiveFiniteScaleProgression(
      baseScale[axis],
      scaleStep.value[axis],
      normalized.data.repeat,
      `repeat scale axis ${axis}`
    );
    if (!closure.ok) return closure;
  }
  repeatedTarget.scale = linearVectorExpression(baseScale, scaleStep.value);
  return normalized;
}

module.exports = { normalizeRepeatWithScale };
