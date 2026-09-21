"use strict";

const INDEX_VAR = "i";

function linearValue(base, index, delta) {
  return base + index * delta;
}

function linearExpression(base, delta) {
  return delta === 0 ? base : ["+", base, ["*", ["var", INDEX_VAR], delta]];
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
  linearExpression,
  proveFiniteRepeat,
  proveFiniteDistinctRepeat
};
