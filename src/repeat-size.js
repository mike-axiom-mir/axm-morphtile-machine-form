"use strict";

const { normalizeRepeatWithRotation } = require("./repeat-rotation");
const { linearExpression, proveFiniteLinear } = require("./repeat-progression");

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeSizeStep(value) {
  if (!Array.isArray(value) || value.length !== 3 || value.some((x) => typeof x !== "number" || !Number.isFinite(x))) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.size_step must be three finite numbers");
  }
  if (value.every((x) => x === 0)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.size_step must change at least one axis");
  }
  return { ok: true, value: value.slice() };
}

function positiveFiniteSizeProgression(base, delta, count, axis) {
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
        `repeat size axis ${axis} produces a non-finite generated value at index ${proof.index}`
      );
    }
    return hold(
      "HOLD_FORM_REPEAT_INVALID",
      `repeat size axis ${axis} must stay greater than zero across the complete repeat domain; index ${proof.index} would be ${proof.detail.value}`
    );
  }
  return { ok: true };
}

function normalizeRepeatWithSize(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat) || repeat.size_step === undefined) {
    return normalizeRepeatWithRotation(repeat);
  }

  const sizeStep = normalizeSizeStep(repeat.size_step);
  if (!sizeStep.ok) return sizeStep;

  const legacyRepeat = { ...repeat };
  delete legacyRepeat.size_step;
  const normalized = normalizeRepeatWithRotation(legacyRepeat);
  if (!normalized.ok) return normalized;

  if (normalized.target_kind !== "part") {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.size_step is only valid for a primitive part target");
  }
  if (normalized.data.repeat < 2) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.size_step requires repeat.count of at least 2 so size can progress");
  }

  const repeatedTarget = normalized.data.body[0];
  const baseSize = repeatedTarget.size;
  for (let axis = 0; axis < 3; axis += 1) {
    const closure = positiveFiniteSizeProgression(baseSize[axis], sizeStep.value[axis], normalized.data.repeat, axis);
    if (!closure.ok) return closure;
  }

  repeatedTarget.size = baseSize.map((base, axis) => linearExpression(base, sizeStep.value[axis]));

  return normalized;
}

module.exports = { normalizeRepeatWithSize };
