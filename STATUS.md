# Status

- Foundation version: 0.15.0
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
- Definition-instance repeat may include `with_step`, a bounded map of finite numeric setting deltas over the fixed repeat index.
- Primitive and definition repeats may include bounded `rot_step` progression over the same fixed repeat index.
- Primitive repeats may include bounded `size_step` progression; the complete positive finite generated size domain is proved before emission.
- Definition repeats may include bounded scalar or vector `scale_step`; the complete positive finite generated scale/component domain is proved before emission, and scalar/vector coercion is not guessed.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.15.0 candidate — bounded in-place repeat progression

Earlier repeat composition required non-zero translation because movement was the only available proof that repeated placements were authored differently. After bounded setting, rotation, primitive-size and definition-scale progression were added, that rule became too strong: a repeat could intentionally remain at one base position while a separately validated progression changed its authored target state.

This candidate adds one bounded distinctness rule above the existing repeat normalizers:

- a repeat with no progression still requires translation on at least one axis;
- `step: [0,0,0]` is accepted only when at least one existing bounded progression field is present and the existing progression validator accepts it;
- `with_step` now also requires `count >= 2`, matching rotation/size/scale progression so an authored delta cannot be accepted when it can never affect a placement;
- the distinctness layer reuses the existing progression validators rather than creating a second progression grammar;
- validation-only movement is private to Form normalization and the exact authored zero base position is restored before candidate matter is emitted;
- standalone `intent.repeat` and repeat blocks inside `intent.compose` share the same distinctness rule;
- pinned-runtime conformance compiles a zero-translation repeat with size + rotation progression through real MorphTile and requires finite non-empty geometry.

This is a semantic authored-state rule, not a visual uniqueness claim. Form does not claim that rotating a symmetric primitive or changing an unused external-definition setting produces a visibly different mesh.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already evaluates compact repeat loops and the progression expressions Form emits. The gap was producer-side repeat admissibility after the producer gained additional bounded ways to change target state; no universal representation/runtime primitive is missing.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first head `f7e7d079a2d92e9df4b27706183f317bd3e4ee5c` intentionally failed before the capability existed. The final 0.15 candidate earns technical validity only if GitHub Actions is green on its exact head against MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

Unit regressions cover zero-translation rotation, primitive-size, definition-scale and definition-setting progression, compose reuse, preservation of the no-progression zero-step HOLD, and the count>=2 setting-progression invariant. Runtime conformance covers real current-core compilation of in-place changing geometry. Independent Verification should replay the final exact candidate head before Director integration. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Scalar/vector step/base coercion, multidimensional grid-setting/grid-rotation/grid-size/grid-scale progression, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
