"use strict";

const { normalizeGridWithRotation } = require("./grid-rotation");

function normalizeGridWithSize(grid) {
  return normalizeGridWithRotation(grid);
}

module.exports = { normalizeGridWithSize };
