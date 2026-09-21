"use strict";

const { normalizeRepeatWithScale } = require("./repeat-scale");

const PROGRESSION_KEYS = Object.freeze(["with_step", "rot_step", "size_step", "scale_step"]);

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function hasBoundedProgression(repeat) {
  return PROGRESSION_KEYS.some((key) => repeat[key] !== undefined);
}

function isExactZeroStep(step) {
  return Array.isArray(step)
    && step.length === 3
    && step.every((value) => typeof value === "number" && value === 0);
}

function authoredBasePosition(repeat) {
  const target = repeat.part !== undefined ? repeat.part : repeat.instance;
  return target && Array.isArray(target.pos) ? target.pos.slice() : [0, 0, 0];
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

  if (!isExactZeroStep(repeat.step) || !hasBoundedProgression(repeat)) {
    return normalizeRepeatWithScale(repeat);
  }

  // Base repeat normalization historically used non-zero translation as its
  // only proof that placements differ. Progression rules now provide another
  // bounded source of authored difference. Reuse the existing full progression
  // validator with a private validation-only movement, then restore the exact
  // authored zero position before returning any candidate matter. The private
  // step is never emitted and never reaches MorphTile.
  const validationRepeat = Object.assign(Object.create(null), repeat, { step: [1, 0, 0] });
  const normalized = normalizeRepeatWithScale(validationRepeat);
  if (!normalized.ok) return normalized;

  normalized.data.body[0].pos = authoredBasePosition(repeat);
  return normalized;
}

module.exports = { normalizeRepeatWithDistinctness };
