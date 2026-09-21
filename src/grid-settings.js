"use strict";

const { normalizeGridWithScale } = require("./grid-scale");
const {
  AXES,
  leafOf,
  affineVector,
  affineScalar,
  affineExpression,
  affineScalarExpression,
  axisAlignedVectorDeltas,
  progressionValidationStep,
  proveFiniteDistinctCartesian
} = require("./grid-progression");

const MAX_INSTANCE_SETTINGS = 32;
const SETTING_NAME = /^[A-Za-z_][A-Za-z0-9_.-]{0,63}$/;

function hold(code, detail) {
  return { ok: false, hold: { code, detail } };
}

function normalizeSettingSteps(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.with_step must be an object keyed by x, y, or z");
  }
  const keys = Object.keys(value).sort();
  const unknown = keys.filter((key) => !AXES.includes(key));
  if (unknown.length) {
    return hold("HOLD_FORM_PARAMETER_UNKNOWN", `grid.with_step has unsupported axis key(s): ${unknown.join(", ")}`);
  }
  if (!keys.length) {
    return hold("HOLD_FORM_GRID_INVALID", "grid.with_step must provide at least one active grid axis");
  }

  const deltas = [null, null, null];
  for (const axisKey of keys) {
    const step = value[axisKey];
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${axisKey} must be an object of finite numeric setting deltas`);
    }
    const settingKeys = Object.keys(step).sort();
    if (settingKeys.length < 1 || settingKeys.length > MAX_INSTANCE_SETTINGS) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${axisKey} must contain 1 to ${MAX_INSTANCE_SETTINGS} setting deltas`);
    }
    const normalized = Object.create(null);
    let changes = false;
    for (const settingKey of settingKeys) {
      if (!SETTING_NAME.test(settingKey)) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${axisKey} contains invalid setting name: ${settingKey}`);
      }
      const delta = step[settingKey];
      if (typeof delta !== "number" || !Number.isFinite(delta)) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${axisKey}.${settingKey} must be a finite number`);
      }
      changes ||= delta !== 0;
      normalized[settingKey] = delta;
    }
    if (!changes) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${axisKey} must change at least one setting`);
    }
    deltas[AXES.indexOf(axisKey)] = normalized;
  }
  return { ok: true, deltas };
}

function settingDeltasForKey(deltas, key) {
  return deltas.map((axisDeltas) => axisDeltas && Object.prototype.hasOwnProperty.call(axisDeltas, key)
    ? axisDeltas[key]
    : null);
}

function settingExpression(base, key, deltas) {
  return affineScalarExpression(base, settingDeltasForKey(deltas, key));
}

function rotationDeltas(grid) {
  return AXES.map((axis) => grid.rot_step && Array.isArray(grid.rot_step[axis]) ? grid.rot_step[axis] : null);
}

function generatedScale(grid, index) {
  const step = grid.scale_step;
  if (!step) {
    if (Array.isArray(grid.instance.scale)) return grid.instance.scale.slice();
    return [grid.instance.scale === undefined ? 1 : grid.instance.scale];
  }

  const first = Object.keys(step).sort()[0];
  const vector = first !== undefined && Array.isArray(step[first]);
  if (!vector) {
    const base = grid.instance.scale === undefined ? 1 : grid.instance.scale;
    const deltas = AXES.map((axis) => typeof step[axis] === "number" ? step[axis] : null);
    return [affineScalar(base, index, deltas)];
  }

  const base = grid.instance.scale === undefined ? [1, 1, 1] : grid.instance.scale;
  const deltas = AXES.map((axis) => Array.isArray(step[axis]) ? step[axis] : null);
  return affineVector(base, index, deltas);
}

function proveDomain(grid, deltas, baseSettings) {
  const counts = grid.counts;
  const pos0 = Array.isArray(grid.instance.pos) ? grid.instance.pos : [0, 0, 0];
  const posDeltas = axisAlignedVectorDeltas(grid.step, counts);
  const rot0 = Array.isArray(grid.instance.rot) ? grid.instance.rot : [0, 0, 0];
  const rotDeltas = rotationDeltas(grid);
  const settingKeys = Object.keys(baseSettings).sort();

  const proof = proveFiniteDistinctCartesian(counts, (index) => {
    const pos = affineVector(pos0, index, posDeltas);
    const rot = affineVector(rot0, index, rotDeltas);
    const scale = generatedScale(grid, index);
    const settings = settingKeys.map((key) => affineScalar(baseSettings[key], index, settingDeltasForKey(deltas, key)));
    return pos.concat(rot, scale, settings);
  });

  if (!proof.ok) {
    const where = `[${proof.index.join(",")}]`;
    if (proof.reason === "nonfinite") {
      return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/scale/setting progression produces a non-finite generated state at ${where}`);
    }
    return hold("HOLD_FORM_GRID_INVALID", `grid position/rotation/scale/setting progression produces a duplicate authored state at ${where}`);
  }
  return { ok: true };
}

function normalizeGridWithSettings(grid) {
  if (!grid || typeof grid !== "object" || Array.isArray(grid) || grid.with_step === undefined) {
    return normalizeGridWithScale(grid);
  }

  const settings = normalizeSettingSteps(grid.with_step);
  if (!settings.ok) return settings;

  const validationGrid = { ...grid };
  delete validationGrid.with_step;
  const validationStep = progressionValidationStep(grid.step, grid.counts, settings.deltas);
  if (validationStep) validationGrid.step = validationStep;

  const normalized = normalizeGridWithScale(validationGrid);
  if (!normalized.ok) return normalized;
  if (normalized.target_kind !== "instance") {
    return hold("HOLD_FORM_GRID_INVALID", "grid.with_step is only valid for a definition instance target");
  }

  for (let axis = 0; axis < 3; axis += 1) {
    if (settings.deltas[axis] && grid.counts[axis] < 2) {
      return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${AXES[axis]} requires grid.counts[${axis}] of at least 2 so settings can progress`);
    }
  }

  const leaf = leafOf(normalized.data);
  const baseSettings = leaf.with || Object.create(null);
  for (let axis = 0; axis < 3; axis += 1) {
    if (!settings.deltas[axis]) continue;
    for (const key of Object.keys(settings.deltas[axis]).sort()) {
      if (!Object.prototype.hasOwnProperty.call(baseSettings, key)) {
        return hold("HOLD_FORM_GRID_INVALID", `grid.with_step.${AXES[axis]}.${key} requires a matching finite numeric instance.with.${key} base`);
      }
    }
  }

  const closure = proveDomain(grid, settings.deltas, baseSettings);
  if (!closure.ok) return closure;

  const pos0 = Array.isArray(grid.instance.pos) ? grid.instance.pos.slice() : [0, 0, 0];
  const posDeltas = axisAlignedVectorDeltas(grid.step, grid.counts);
  leaf.pos = pos0.map((base, component) => affineExpression(base, component, posDeltas));
  const stepped = { ...baseSettings };
  for (const key of Object.keys(baseSettings).sort()) {
    stepped[key] = settingExpression(baseSettings[key], key, settings.deltas);
  }
  leaf.with = stepped;
  return normalized;
}

module.exports = { normalizeGridWithSettings };
