# Status

- Foundation version: 0.19.0
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
- Primitive and definition repeats may include bounded `rot_step` progression over the fixed repeat index.
- Primitive repeats may include bounded `size_step` progression; the complete positive finite generated size domain is proved before emission.
- Definition repeats may include bounded scalar or vector `scale_step`; the complete positive finite generated scale/component domain is proved before emission, and scalar/vector coercion is not guessed.
- Repeat may remain at one translation coordinate when another validated progression changes authored target state.
- Grid may include bounded per-axis `rot_step`; active axes may remain translation-stationary when their own rotation progression changes authored state.
- Primitive grids may include bounded per-axis `size_step`; positive finite size and full position+rotation+size Cartesian distinctness are proved before emission.
- Definition grids may include bounded per-axis scalar/vector `scale_step`; positive finite scale and full position+rotation+scale Cartesian distinctness are proved before emission.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.19.0 candidate — bounded per-axis definition grid setting progression

The repeat lane already had bounded definition `with_step`; the grid lane already had fixed `gx`, `gy`, and `gz` variables plus bounded per-axis rotation and definition scale progression. Current MorphTile already evaluates expression-valued definition settings inside recipe loop scope. The remaining evidence-backed producer gap was multidimensional progression of existing finite numeric definition settings without exposing arbitrary expression authoring.

This candidate adds optional definition-only `grid.with_step`:

- `with_step` is keyed only by `x`, `y`, or `z`;
- each provided axis contains 1..32 finite numeric setting deltas;
- every stepped setting must already exist as an own finite numeric base in `instance.with`;
- each progression axis must change at least one setting and must contain at least two cells;
- a definition grid axis may remain translation-stationary when that same axis owns validated setting progression;
- active axes with neither translation nor their own rotation/scale/setting progression still HOLD;
- setting progression composes with existing definition `rot_step` and scalar/vector `scale_step` using the same fixed `gx`/`gy`/`gz` loop variables;
- the machine proves the complete Cartesian position+rotation+scale+settings authored-state domain remains finite and distinct, including non-adjacent cross-axis setting cancellation;
- there is deliberately no invented positivity/range rule for arbitrary definition settings because their domain meaning belongs to the referenced definition;
- standalone `intent.grid` and grid blocks inside `intent.compose` share the exact same rule;
- primitive grids reject `with_step` rather than treating definition settings as primitive dimensions;
- pinned-runtime conformance resolves a real parametric definition and requires the emitted per-cell width/depth setting expressions to produce finite geometry that differs from a fixed-setting control.

This is an authored-state rule, not a visual or semantic-effect claim. A referenced definition may ignore an authored setting, or different setting values may render equivalently. Form proves deterministic finite transport and combined-state distinctness; the external definition/runtime owns meaning.

## Placement

This belongs in Form Machine, not MorphTile core. Current MorphTile already owns definition `use`, expression-valued `with` settings, nested recipe loops, loop variables and expression evaluation. The missing piece was bounded creation vocabulary plus producer-side complete-domain proof.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first head `4180d56c9f4cf981507006d81f4aa9125070df29` intentionally failed before the capability existed; Actions run `35559047033` completed FAILURE.

Functional implementation head `f49e0523b3fa7de7cd2e018b0da2822f505e2675` then passed Actions run `35559135517`, including `npm test` against pinned MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

Final exact-head CI must remain green after version/documentation receipts, and independent Verification should replay that exact head before Director integration.

Unit regressions cover stationary multi-axis setting progression, composition with simultaneous rotation and definition scale progression, `intent.compose` reuse, primitive-target rejection, empty/unknown-axis/missing-base/no-op/inactive-axis rejection, finite-authored overflow, non-adjacent cross-axis cancellation, and preservation of the active-axis distinctness rule. Runtime conformance covers real current-core definition resolution and compares changing-setting output with a fixed-setting control. Visual/aesthetic quality and arbitrary external-setting semantic effect remain outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Arbitrary definition-setting semantic/range inference, scalar/vector coercion or broadcasting, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
