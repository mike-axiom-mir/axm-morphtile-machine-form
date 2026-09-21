"use strict";

const INDEX_VAR = "i";

function linearValue(base, index, delta) {
  return base + index * delta;
}

function linearVector(base, index, deltas) {
  return base.map((value, component) => linearValue(value, index, deltas[component]));
}

function linearExpression(base, delta) {
  return delta === 0 ? base : ["+", base, ["*", ["var", INDEX_VAR], delta]];
}

function repeatValidationStep(step, activeProgression) {
  if (!Array.isArray(step) || step.length !== 3
      || step.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return null;
  }

  const validationStep = step.slice();
  if (activeProgression && validationStep.every((value) => value === 0)) {
    validationStep[0] = 1;
  }
  return validationStep;
}

function proveFiniteRepeat(count, stateAt, validateState) {
  for (let index = 0; index < count; index += 1) {
    const state = stateAt(index);
    if (!Array.isArray(state) || state.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      return { ok: false, reason: "nonfinite", index };
    }
    if (validateState) {
      const detail = validateState(state, index);
      if (detail !== null && detail !== undefined && detail !== false) {
        return { ok: false, reason: "domain", index, detail };
      }
    }
  }
  return { ok: true };
}

function proveFiniteLinear(count, base, delta, validateValue) {
  return proveFiniteRepeat(
    count,
    (index) => [linearValue(base, index, delta)],
    validateValue
      ? (state, index) => validateValue(state[0], index)
      : undefined
  );
}

function proveFiniteDistinctRepeat(count, stateAt, validateState) {
  const seen = new Set();
  for (let index = 0; index < count; index += 1) {
    const state = stateAt(index);
    if (!Array.isArray(state) || state.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      return { ok: false, reason: "nonfinite", index };
    }
    if (validateState) {
      const detail = validateState(state, index);
      if (detail !== null && detail !== undefined && detail !== false) {
        return { ok: false, reason: "domain", index, detail };
      }
    }
    const key = JSON.stringify(state);
    if (seen.has(key)) {
      return { ok: false, reason: "duplicate", index };
    }
    seen.add(key);
  }
  return { ok: true };
}

module.exports = {
  INDEX_VAR,
  linearValue,
  linearVector,
  linearExpression,
  repeatValidationStep,
  proveFiniteRepeat,
  proveFiniteLinear,
  proveFiniteDistinctRepeat
};
