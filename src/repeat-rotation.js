"use strict";

const { normalizePrimitiveRepeat } = require("./form-vocabulary");

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeRotationStep(value) {
  if (!Array.isArray(value) || value.length !== 3 || value.some((x) => typeof x !== "number" || !Number.isFinite(x))) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.rot_step must be three finite numbers");
  }
  if (value.every((x) => x === 0)) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.rot_step must rotate at least one axis");
  }
  return { ok: true, value: value.slice() };
}

function finiteRotationProgression(base, delta, count, axis) {
  for (let index = 0; index < count; index += 1) {
    if (!Number.isFinite(base + index * delta)) {
      return hold(
        "HOLD_FORM_REPEAT_INVALID",
        `repeat rotation axis ${axis} produces a non-finite generated value at index ${index}`
      );
    }
  }
  return { ok: true };
}

function normalizeRepeatWithRotation(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat) || repeat.rot_step === undefined) {
    return normalizePrimitiveRepeat(repeat);
  }

  const rotStep = normalizeRotationStep(repeat.rot_step);
  if (!rotStep.ok) return rotStep;

  const legacyRepeat = { ...repeat };
  delete legacyRepeat.rot_step;
  const normalized = normalizePrimitiveRepeat(legacyRepeat);
  if (!normalized.ok) return normalized;

  if (normalized.data.repeat < 2) {
    return hold("HOLD_FORM_REPEAT_INVALID", "repeat.rot_step requires repeat.count of at least 2 so rotation can progress");
  }

  const repeatedTarget = normalized.data.body[0];
  const baseRot = repeatedTarget.rot || [0, 0, 0];

  for (let axis = 0; axis < 3; axis += 1) {
    const closure = finiteRotationProgression(baseRot[axis], rotStep.value[axis], normalized.data.repeat, axis);
    if (!closure.ok) return closure;
  }

  repeatedTarget.rot = baseRot.map((base, axis) => {
    const delta = rotStep.value[axis];
    return delta === 0 ? base : ["+", base, ["*", ["var", "i"], delta]];
  });

  return normalized;
}

module.exports = { normalizeRepeatWithRotation };
