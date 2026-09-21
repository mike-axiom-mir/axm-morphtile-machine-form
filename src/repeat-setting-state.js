"use strict";

const { linearValue, linearExpression } = require("./repeat-progression");

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function orderedSettingKeys(baseSettings) {
  return Object.keys(baseSettings || {}).sort();
}

function settingDelta(withStep, key) {
  return withStep && hasOwn(withStep, key) ? withStep[key] : 0;
}

function generatedSettingValues(baseSettings, withStep, index) {
  return orderedSettingKeys(baseSettings).map((key) => (
    linearValue(baseSettings[key], index, settingDelta(withStep, key))
  ));
}

function settingExpressionState(baseSettings, withStep) {
  const state = { ...(baseSettings || {}) };
  for (const key of orderedSettingKeys(baseSettings)) {
    state[key] = linearExpression(baseSettings[key], settingDelta(withStep, key));
  }
  return state;
}

module.exports = {
  generatedSettingValues,
  settingExpressionState
};
