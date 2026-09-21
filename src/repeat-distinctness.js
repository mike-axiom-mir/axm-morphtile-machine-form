"use strict";

const { normalizeRepeatWithScale } = require("./repeat-scale");
const { generatedRotationFromRepeat } = require("./repeat-rotation-state");
const { generatedScaleFromRepeat } = require("./repeat-scale-state");
const { generatedSettingValues } = require("./repeat-setting-state");
const { generatedSizeFromRepeat } = require("./repeat-size-state");
const {
  linearVector,
  repeatValidationStep,
  proveFiniteDistinctRepeat
} = require("./repeat-progression");

const PROGRESSION_KEYS = Object.freeze(["with_step", "rot_step", "size_step", "scale_step"]);

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function hasBoundedProgression(repeat) {
  return PROGRESSION_KEYS.some((key) => repeat[key] !== undefined);
}

function authoredTarget(repeat) {
  return repeat.part !== undefined ? repeat.part : repeat.instance;
}

function authoredBasePosition(repeat) {
  const target = authoredTarget(repeat);
  return target && Array.isArray(target.pos) ? target.pos.slice() : [0, 0, 0];
}

function generatedRepeatState(repeat, index) {
  const target = authoredTarget(repeat);
  const state = [];

  const basePos = Array.isArray(target.pos) ? target.pos : [0, 0, 0];
  state.push(...linearVector(basePos, index, repeat.step));

  state.push(...generatedRotationFromRepeat(repeat, index));

  if (repeat.part !== undefined) {
    state.push(...generatedSizeFromRepeat(repeat, index));
    return state;
  }

  state.push(...generatedScaleFromRepeat(repeat, index));

  const baseSettings = target.with || {};
  const settingStep = repeat.with_step || {};
  state.push(...generatedSettingValues(baseSettings, settingStep, index));

  return state;
}

function proveAuthoredDistinctness(repeat) {
  const proof = proveFiniteDistinctRepeat(repeat.count, (index) => generatedRepeatState(repeat, index));
  if (proof.ok) return proof;
  if (proof.reason === "nonfinite") {
    return hold(
      "HOLD_FORM_REPEAT_INVALID",
      `repeat generated authored state becomes non-finite at index ${proof.index}`
    );
  }
  return hold(
    "HOLD_FORM_REPEAT_INVALID",
    `repeat generated authored state is a duplicate authored state at index ${proof.index}`
  );
}

function normalizeRepeatWithDistinctness(repeat) {
  if (!repeat || typeof repeat !== "object" || Array.isArray(repeat)) {
    return normalizeRepeatWithScale(repeat);
  }

  // A setting delta cannot affect a one-placement repeat. The other progression
  // normalizers already enforce the same >=2 rule for rotation/size/scale.
  if (repeat.with_step !== undefined && repeat.count === 1) {
    return hold(
      "HOLD_FORM_REPEAT_INVALID",
      "repeat.with_step requires repeat.count of at least 2 so the setting progression can take effect"
    );
  }

  const validationStep = repeatValidationStep(repeat.step, hasBoundedProgression(repeat));
  const needsValidationMovement = validationStep !== null
    && Array.isArray(repeat.step)
    && validationStep.some((value, axis) => value !== repeat.step[axis]);

  let normalized;
  if (!needsValidationMovement) {
    normalized = normalizeRepeatWithScale(repeat);
  } else {
    // Base repeat normalization historically used non-zero translation as its
    // first admissibility check. A validated progression can also distinguish
    // placements, so use private validation-only movement and restore authored
    // position before returning any candidate matter. Complete generated-state
    // distinctness is proved below against the original authored repeat.
    const validationRepeat = Object.assign(Object.create(null), repeat, { step: validationStep });
    normalized = normalizeRepeatWithScale(validationRepeat);
    if (normalized.ok) normalized.data.body[0].pos = authoredBasePosition(repeat);
  }

  if (!normalized.ok) return normalized;

  const distinctness = proveAuthoredDistinctness(repeat);
  if (!distinctness.ok) return distinctness;
  return normalized;
}

module.exports = { normalizeRepeatWithDistinctness };
