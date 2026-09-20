# Status

- Foundation version: 0.12.0
- State: CANDIDATE — EXACT-HEAD CI + INDEPENDENT REVIEW REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at 2bdf8eade1376055473b9cc1b11734b72a5566e5
- Envelope: provisional v0.1
- Visual proof: none

## Integrated behavior inherited by this candidate

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available with an explicit runtime-validation warning.
- Pinned-runtime conformance executes emitted primitives and compositions through real MorphTile create/validate/compile contracts.
- `intent.parts` provides bounded deterministic flat composition for 1..64 primitive parts.
- `intent.repeat` provides compact bounded parametric repetition for one normalized primitive or definition instance.
- `intent.grid` provides bounded axis-aligned 1D/2D/3D repetition for one normalized primitive or definition instance.
- `intent.instances` provides bounded deterministic reuse of 1..64 existing MorphTile definitions through recipe `use` parts.
- `intent.compose` combines direct primitive/definition targets and the bounded repeat/grid operators under one 64-placement request budget.
- Intent modes fail closed on fields they would otherwise ignore.
- Definition-instance `intent.repeat` may include `with_step`, a bounded 1..32 map of finite numeric setting deltas.
- Every stepped setting must already have a finite numeric base in `instance.with`; the machine does not invent definition defaults or setting names.
- Each stepped setting compiles to `base + i * delta` using the fixed repeat-loop index; callers still do not author arbitrary expression trees.
- Primitive and definition repeats may include bounded `rot_step` progression over the same fixed repeat index.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings are normalized into a prototype-independent dictionary so authored own keys such as `__proto__`, `constructor`, and `toString` remain data rather than host-language prototype behavior.
- The exact receiver proof is re-pinned to MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`, the merged core that preserves exact own-key identity across recipe and kit registries.

## 0.12.0 candidate — bounded repeat size progression

Form already exposes bounded repeat translation, definition-setting progression and rotation progression. MorphTile recipes already accept expression-valued primitive size components, so ordinary repeated growth/taper still required callers to drop into the expert arbitrary-recipe lane even though the substrate primitive already existed.

This candidate adds optional `repeat.size_step` for primitive repeat targets. It is intentionally narrower than arbitrary scale expressions:

- exactly three finite numeric size deltas;
- at least one axis must change;
- primitive-part repeat targets only; definition-instance scaling remains held rather than guessed;
- repeat count must be at least two when `size_step` is present;
- every generated `base size + i * delta` value is checked over the complete bounded repeat domain before emission;
- every generated size component must remain finite and strictly greater than zero;
- active axes compile to `base + i * delta` using the existing fixed repeat index `i`;
- `size_step` composes with existing primitive `rot_step` because both transform the same already-bounded target without creating a new evaluator;
- repeat blocks inside `intent.compose` reuse the same rule;
- real MorphTile receiver conformance compares changing-size output with an equivalent fixed-size repeat and requires finite compiled geometry.

The candidate does not add arbitrary caller-authored size expressions, definition-instance scale progression, grid-axis size progression, radial/trigonometric placement, recursive bodies, custom loop variables, conditions or autonomous geometry invention.

## Placement

`size_step` belongs in Form Machine, not MorphTile core. Current MorphTile already evaluates bounded recipe expressions in primitive size fields; the missing capability was a small deterministic producer vocabulary for a common geometry pattern. The runtime remains the authority for ordinary recipe execution and compiled-mesh truth boundaries.

The runtime pin also moves from the prior recipe-own-key core to current MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`, so this candidate is proved against the merged registry-own-key substrate rather than a stale receiver.

No new universal MorphTile representation/runtime primitive was found in this activation.

## Evidence boundary

The candidate earns technical validity only if GitHub Actions is green on its exact head against the pinned MorphTile runtime. Unit regressions cover generated size expressions, coexistence with rotation, compose reuse, malformed/no-op inputs, definition-instance rejection, single-copy misuse, non-positive generated sizes and non-finite expansion. Runtime conformance must validate and compile the emitted recipe through the exact pinned core and prove the size progression changes finite geometry.

Independent Verification should replay the final exact candidate head before Director integration. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, multidimensional grid-setting/grid-rotation/grid-size progression, definition-instance scale progression, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
