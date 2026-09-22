const test = require("node:test");
const assert = require("node:assert/strict");

const { leafOf } = require("../src/grid-progression");

function loadVocabularyWithPositionProbe() {
  const helperPath = require.resolve("../src/grid-position-state");
  const vocabularyPath = require.resolve("../src/form-vocabulary");
  const helper = require(helperPath);
  const calls = { state: 0, expression: 0 };

  require.cache[helperPath].exports = {
    ...helper,
    positionState(...args) {
      calls.state += 1;
      return helper.positionState(...args);
    },
    positionExpressionState(...args) {
      calls.expression += 1;
      return helper.positionExpressionState(...args);
    }
  };
  delete require.cache[vocabularyPath];

  return {
    vocabulary: require(vocabularyPath),
    calls,
    restore() {
      delete require.cache[vocabularyPath];
      require.cache[helperPath].exports = helper;
    }
  };
}

test("base grid owner consumes the shared position-state representation for proof and emission", () => {
  const probe = loadVocabularyWithPositionProbe();
  try {
    const out = probe.vocabulary.normalizeGrid({
      counts: [2, 1, 3],
      step: [0.5, 99, -1],
      part: { shape: "box", pos: [10, -2, 3] }
    });

    assert.equal(out.ok, true);
    assert.equal(probe.calls.state, 1);
    assert.equal(probe.calls.expression, 1);

    const leaf = leafOf(out.data);
    assert.deepEqual(leaf.pos, [
      ["+", 10, ["*", ["var", "gx"], 0.5]],
      -2,
      ["+", 3, ["*", ["var", "gz"], -1]]
    ]);
  } finally {
    probe.restore();
  }
});
