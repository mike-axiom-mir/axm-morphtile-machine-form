# Status

- Foundation version: 0.17.0
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
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.17.0 candidate — bounded per-axis primitive grid size progression

The existing grid rule already had fixed `gx`, `gy`, and `gz` loop variables, and MorphTile already evaluates expression-valued primitive size in recipe scope. The missing machine vocabulary was a bounded producer rule for multidimensional primitive growth/taper without exposing arbitrary expression authoring.

This candidate adds optional primitive-only `grid.size_step`:

- `size_step` is keyed only by `x`, `y`, or `z`;
- each provided grid axis carries exactly three finite dimension deltas and must change at least one size component;
- each provided size-progression axis must have at least two cells;
- a primitive grid axis may remain at one translation coordinate when that same axis has validated size progression;
- active axes with neither translation nor their own rotation/size progression still HOLD;
- size and rotation progression may coexist and share the fixed `gx`/`gy`/`gz` variables;
- every generated primitive size component across the complete bounded Cartesian domain must remain finite and strictly positive;
- the complete generated position+rotation+size authored-state domain must remain distinct, so cross-axis cancellation cannot silently stack cells;
- standalone `intent.grid` and grid blocks inside `intent.compose` share the exact same rule;
- definition-instance grids reject `size_step` rather than inventing primitive-size semantics for reusable forms;
- pinned-runtime conformance requires current MorphTile to consume a real multi-axis size progression with simultaneous rotation and compile finite changing geometry.

This is an authored-state rule, not a visual uniqueness claim. Different dimensions/rotations can still produce visually equivalent results for some symmetric matter.

## Placement

This belongs in Form Machine, not MorphTile core. Current MorphTile already owns the universal nested-loop and expression-evaluation substrate, including expression-valued primitive size. The missing piece was bounded creation vocabulary plus producer-side Cartesian-domain proof.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first head `ff4fbabdbfaa51a99fafd0f98ba70d1398d1d155` intentionally failed before the capability existed: Actions run `35552238964` completed FAILURE with 284 pass / 6 fail, all six new grid-size regressions red while the inherited suite stayed green.

Functional implementation head `9bdc0cde8a1fac5995ef96474fc19278633d1809` passed all 290 tests against pinned MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5` in Actions run `35552345443`. The runtime receipt was then strengthened to require multi-axis size progression plus rotation through the real receiver before final exact-head publication.

Final exact-head CI must remain green after version/documentation/receipt updates, and independent Verification should replay that exact head before Director integration.

Unit regressions cover stationary-axis primitive size progression, multi-axis size + rotation composition, compose reuse, malformed/no-op/inactive/wrong-target inputs, non-positive generated size, finite-authored overflow, cross-axis cancellation collision, and preservation of the active-axis distinctness rule. Runtime conformance covers real current-core compilation and compares changing-size output with a fixed-size control. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Scalar/vector step/base coercion, multidimensional grid definition-setting and definition-scale progression, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
