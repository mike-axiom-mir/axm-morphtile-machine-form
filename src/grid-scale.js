"use strict";

const { normalizeGridWithSize } = require("./grid-size");
const {
  AXES,
  VARS,
  leafOf,
  affineVector,
  affineScalar,
  affineExpression,
  affineScalarExpression,
  proveFiniteDistinctCartesian
} = require("./grid-progression");

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeScaleSteps(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.scale_step must be an object keyed by x, y, or z");
  }
  const keys = Object.keys(value).sort();
  const unknown = keys.filter((key) => !AXES.includes(key));
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `grid.scale_step has unsupported axis key(s): ${unknown.join(", ")}`);
  }
  if (!keys.length) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.scale_step must provide at least one active grid axis");
  }

  let kind = null;
  const deltas = [null, null, null];
  for (const key of keys) {
    const valueForAxis = value[key];
    let axisKind;
    let delta;
    if (typeof valueForAxis === "number") {
      if (!Number.isFinite(valueForAxis)) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.scale_step.${key} scalar must be finite`);
      }
      if (valueForAxis === 0) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.scale_step.${key} must change scale`);
      }
      axisKind = "scalar";
      delta = valueForAxis;
    } else {
      if (!Array.isArray(valueForAxis) || valueForAxis.length !== 3 || valueForAxis.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.scale_step.${key} must be one finite number or three finite per-axis numbers`);
      }
      if (valueForAxis.every((item) => item === 0)) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.scale_step.${key} must change scale on at least one component`);
      }
      axisKind = "vector";
      delta = valueForAxis.slice();
    }
    if (kind && kind !== axisKind) {
      return hold("HOLD_FORM_GRID_INVALID", "grid.scale_step may not mix scalar and vector progression across grid axes");
    }
    kind = axisKind;
    deltas[AXES.indexOf(key)] = delta;
  }
  return { ok: true, kind, deltas };
}

function rotationDeltas(grid) {
  return AXES.map((axis) => grid.rot_step && Array.isArray(grid.rot_step[axis]) ? grid.rot_step[axis] : null);
}

function proveDomain(grid, scale) {
  const target = grid.instance;
  const counts = grid.counts;
  const step = grid.step;
  const pos0 = Array.isArray(target.pos) ? target.pos : [0, 0, 0];
  const rot0 = Array.isArray(target.rot) ? target.rot : [0, 0, 0];
  const rotDeltas = rotationDeltas(grid);

  let baseScale;
  if (scale.kind === "scalar") {
    if (Array.isArray(target.scale)) {
      return hold("HOLD_FORM_GRID_INVALID", "scalar grid.scale_step requires scalar instance.scale or omitted unit scale");
    }
    baseScale = target.scale === undefined ? 1 : target.scale;
  } else {
    if (target.scale !== undefined && !Array.isArray(target.scale)) {
      return hold("HOLD_FORM_GRID_INVALID", "vector grid.scale_step requires vector instance.scale or omitted unit scale");
    }
    baseScale = target.scale === undefined ? [1, 1, 1] : target.scale.slice();
  }

  const scaleWidth = scale.kind === "scalar" ? 1 : 3;
  const proof = proveFiniteDistinctCartesian(
    counts,
    (index) => {
      const pos = pos0.map((base, axis) => base + index[axis] * step[axis]);
      const rot = affineVector(rot0, index, rotDeltas);
      const generatedScale = scale.kind === "scalar"
        ? [affineScalar(baseScale, index, scale.deltas)]
        : affineVector(baseScale, index, scale.deltas);
      return pos.concat(rot, generatedScale);
    },
    (state) => state.slice(-scaleWidth).some((value) => value <= 0) ? "scale_nonpositive" : null
  );
  if (!proof.ok) {
    const where = `[${proof.index.join(",")}]`;
    if (proof.reason === "nonfinite") {
      return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/scale progression produces a non-finite generated state at ${where}`);
    }
    if (proof.reason === "domain") {
      return hold("HOLD_FORM_GRID_INVALID", `grid scale progression must stay greater than zero across the complete Cartesian domain; generated state ${where} is invalid`);
    }
    return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/scale progression produces a duplicate authored state at ${where}`);
  }
  return { ok: true, baseScale };
}

function normalizeGridWithScale(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid) || grid.scale_step === undefined) {
    return normalizeGridWithSize(grid);
  }

  const scale = normalizeScaleSteps(grid.scale_step);
  if (!scale.ok) return scale;

  const validationGrid = { ...grid };
  delete validationGrid.scale_step;
  if (Array.isArray(grid.counts) && grid.counts.length === 3 && Array.isArray(grid.step) && grid.step.length === 3) {
    validationGrid.step = grid.step.slice();
    for (let axis = 0; axis < 3; axis += 1) {
      if (grid.counts[axis] > 1 && validationGrid.step[axis] === 0 && scale.deltas[axis] !== null) validationGrid.step[axis] = 1;
    }
  }

  const normalized = normalizeGridWithSize(validationGrid);
  if (!normalized.ok) return normalized;
  if (normalized.target_kind !== "instance") {
    return hold("HOLD_FORM_GRID_INVALID", "grid.scale_step is only available for definition-instance grids; primitive grids use size_step");
  }

  for (let axis = 0; axis < 3; axis += 1) {
    if (scale.deltas[axis] !== null && grid.counts[axis] < 2) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.scale_step.${AXES[axis]} requires grid.counts[${axis}] of at least 2 so scale can progress`);
    }
  }

  const closure = proveDomain(grid, scale);
  if (!closure.ok) return closure;

  const leaf = leafOf(normalized.data);
  const pos0 = Array.isArray(grid.instance.pos) ? grid.instance.pos.slice() : [0, 0, 0];
  leaf.pos = pos0.map((base, axis) => grid.counts[axis] === 1 || grid.step[axis] === 0 ? base : ["+", base, ["*", ["var", VARS[axis]], grid.step[axis]]]);
  if (scale.kind === "scalar") {
    leaf.scale = affineScalarExpression(closure.baseScale, scale.deltas);
  } else {
    leaf.scale = closure.baseScale.map((base, component) => affineExpression(base, component, scale.deltas));
  }
  return normalized;
}

module.exports = { normalizeGridWithScale };
