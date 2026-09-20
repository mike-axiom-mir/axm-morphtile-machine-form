# Status

- Foundation version: 0.11.0
- State: CANDIDATE — EXACT-HEAD CI + INDEPENDENT REVIEW REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at 429a344f7d9333bef01cf9de1c292c3af09abec2
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
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- The exact integrated receiver proof targets MorphTile `429a344f7d9333bef01cf9de1c292c3af09abec2`, including `HOLD_RECIPE_NONFINITE_VALUE` and `HOLD_MESH_NONFINITE_VALUE` runtime boundaries.

## 0.11.0 candidate — bounded repeat rotation progression

MorphTile already uses recipe-loop-index expressions for ordinary repeated geometry whose rotation changes per copy, including its built-in spiral/stair-like recipe pattern. Form previously exposed bounded translation progression and definition-setting progression, but a caller still needed the expert arbitrary-recipe escape hatch to express the common `base rotation + i * delta` pattern.

This candidate adds optional `repeat.rot_step` for the existing bounded repeat rule. It is intentionally smaller than general transform expressions:

- available for either primitive or definition-instance repeat targets;
- exactly three finite numeric angular deltas;
- at least one axis must change;
- repeat count must be at least two when `rot_step` is present;
- every generated rotation value is checked across the entire bounded repeat domain before emission;
- existing normalized target rotation is preserved as the base, defaulting to `[0,0,0]` only when the target has no authored rotation;
- active axes compile to `base + i * delta` using the existing fixed repeat index `i`;
- the same rule is reused by repeat blocks inside `intent.compose`;
- `rot_step` and definition-only `with_step` may coexist because they affect separate fields on the same already-bounded target/index.

The candidate does not add arbitrary caller-authored transform expressions, custom loop variables, recursive bodies, radial/trigonometric placement, grid-axis rotation progression or autonomous geometry invention.

## Placement

This rule belongs in Form Machine, not MorphTile core. MorphTile already has the universal ingredients: expression-valued recipe transforms, deterministic repeat-loop variables, transform application and runtime mesh compilation. The missing capability was a bounded creation-side vocabulary rule that converts a repeated ordinary geometry pattern into deterministic MorphTile matter.

No new universal MorphTile representation/runtime primitive was found in this activation.

## Evidence boundary

The candidate earns technical validity only if GitHub Actions is green on its exact head against the pinned MorphTile runtime. The new tests cover primitive and definition-instance rotation progression, compose reuse, malformed/no-op/single-count/overflow HOLDs, preservation of unknown-field fail-closed behavior, and real pinned-runtime execution where generated turning geometry differs from the equivalent non-turning repeat while preserving bounded part/triangle counts.

Independent Verification should replay the final exact candidate head before Director integration. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, multidimensional grid-setting or grid-rotation progression, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
