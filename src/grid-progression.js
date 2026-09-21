"use strict";

const AXES = Object.freeze(["x", "y", "z"]);
const VARS = Object.freeze(["gx", "gy", "gz"]);

function leafOf(node) {
  let current = node;
  while (current && typeof current === "object" && Number.isInteger(current.repeat) && Array.isArray(current.body)) {
    current = current.body[0];
  }
  return current;
}

function forEachCartesian(counts, visit) {
  for (let gx = 0; gx < counts[0]; gx += 1) {
    for (let gy = 0; gy < counts[1]; gy += 1) {
      for (let gz = 0; gz < counts[2]; gz += 1) {
        visit([gx, gy, gz]);
      }
    }
  }
}

function affineVector(base, index, deltas) {
  return base.map((value, component) => value + index.reduce((sum, item, axis) => {
    const axisDelta = deltas[axis];
    return sum + (axisDelta ? item * axisDelta[component] : 0);
  }, 0));
}

function affineScalar(base, index, deltas) {
  return base + index.reduce((sum, item, axis) => {
    const delta = deltas[axis];
    return sum + (delta === null || delta === undefined ? 0 : item * delta);
  }, 0);
}

function affineExpression(base, component, deltas) {
  let out = base;
  for (let axis = 0; axis < 3; axis += 1) {
    const axisDelta = deltas[axis];
    if (!axisDelta || axisDelta[component] === 0) continue;
    out = ["+", out, ["*", ["var", VARS[axis]], axisDelta[component]]];
  }
  return out;
}

function affineScalarExpression(base, deltas) {
  let out = base;
  for (let axis = 0; axis < 3; axis += 1) {
    const delta = deltas[axis];
    if (delta === null || delta === undefined || delta === 0) continue;
    out = ["+", out, ["*", ["var", VARS[axis]], delta]];
  }
  return out;
}

function axisAlignedVectorDeltas(step, counts) {
  return step.map((delta, axis) => {
    if (delta === 0 || (counts && counts[axis] === 1)) return null;
    const vector = [0, 0, 0];
    vector[axis] = delta;
    return vector;
  });
}

function progressionValidationStep(step, counts, deltas) {
  if (!Array.isArray(step) || step.length !== 3
      || !Array.isArray(counts) || counts.length !== 3
      || !Array.isArray(deltas) || deltas.length !== 3) {
    return null;
  }

  const validationStep = step.slice();
  for (let axis = 0; axis < 3; axis += 1) {
    const activeProgression = deltas[axis] !== null && deltas[axis] !== undefined;
    if (counts[axis] > 1 && validationStep[axis] === 0 && activeProgression) {
      validationStep[axis] = 1;
    }
  }
  return validationStep;
}

function proveFiniteDistinctCartesian(counts, stateAt, validateState) {
  const seen = new Set();
  let failure = null;
  forEachCartesian(counts, (index) => {
    if (failure) return;
    const state = stateAt(index);
    if (!Array.isArray(state) || state.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      failure = { ok: false, reason: "nonfinite", index };
      return;
    }
    if (validateState) {
      const detail = validateState(state, index);
      if (detail) {
        failure = { ok: false, reason: "domain", index, detail };
        return;
      }
    }
    const key = JSON.stringify(state);
    if (seen.has(key)) {
      failure = { ok: false, reason: "duplicate", index };
      return;
    }
    seen.add(key);
  });
  return failure || { ok: true };
}

module.exports = {
  AXES,
  VARS,
  leafOf,
  forEachCartesian,
  affineVector,
  affineScalar,
  affineExpression,
  affineScalarExpression,
  axisAlignedVectorDeltas,
  progressionValidationStep,
  proveFiniteDistinctCartesian
};
