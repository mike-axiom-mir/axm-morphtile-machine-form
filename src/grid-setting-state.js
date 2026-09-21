"use strict";

const { affineScalar, affineScalarExpression } = require("./grid-progression");

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function orderedSettingKeys(baseSettings) {
  return Object.keys(baseSettings || {}).sort();
}

function settingDeltasForKey(deltas, key) {
  return deltas.map((axisDeltas) => (
    axisDeltas && hasOwn(axisDeltas, key) ? axisDeltas[key] : null
  ));
}

function generatedSettingValues(baseSettings, deltas, index) {
  return orderedSettingKeys(baseSettings).map((key) => (
    affineScalar(baseSettings[key], index, settingDeltasForKey(deltas, key))
  ));
}

function settingExpressionState(baseSettings, deltas) {
  const state = { ...(baseSettings || {}) };
  for (const key of orderedSettingKeys(baseSettings)) {
    state[key] = affineScalarExpression(baseSettings[key], settingDeltasForKey(deltas, key));
  }
  return state;
}

module.exports = {
  generatedSettingValues,
  settingExpressionState
};
