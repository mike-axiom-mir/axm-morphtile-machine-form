# Status

- Foundation version: 0.16.0
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
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.16.0 candidate — bounded per-axis grid rotation progression

The existing grid rule already had fixed `gx`, `gy`, and `gz` loop variables and MorphTile already evaluates expression-valued target rotation. The missing machine vocabulary was the bounded producer rule that connects those two capabilities without opening general expression authoring.

This candidate adds optional `grid.rot_step`:

- `rot_step` is keyed only by `x`, `y`, or `z`;
- each provided axis carries exactly three finite rotation deltas and must change at least one rotation component;
- a provided rotation axis must have at least two cells;
- an active grid axis may use zero translation only when that same axis has a validated rotation progression;
- active axes with neither translation nor their own rotation progression still HOLD;
- multiple axis progressions compose through the fixed `gx`/`gy`/`gz` variables without materializing cell copies;
- the complete bounded generated position+rotation state domain is checked for finiteness and duplicate authored states before emission, so canceling multidimensional progressions HOLD instead of silently stacking cells;
- standalone `intent.grid` and grid blocks inside `intent.compose` share the exact same rule;
- pinned-runtime conformance requires current MorphTile to consume the emitted rotation expression as finite changing geometry.

This is an authored-state rule, not a visual uniqueness claim. Rotating symmetric matter can remain visually identical.

## Placement

This belongs in Form Machine, not MorphTile core. Current MorphTile already owns the universal nested-loop and expression-evaluation substrate, including expression-valued rotation. The missing piece was a bounded geometry vocabulary rule and its producer-side domain proof.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first head `ba79191aa14e6defb134382c5de8151e012abfb3` intentionally failed before the capability existed. An intermediate candidate at `acf581bd7da3fa4551dee2c8ff4df438986f57f3` also failed and preserved an implementation defect: inactive rotation axes were accidentally serialized as `null` expression terms, which the pinned MorphTile receiver correctly rejected as non-finite recipe matter. The repair makes inactive axes absent from emitted expressions rather than coercing them.

Functional repair head `5a6dd504aecf0fa84373eb78441c2f0148a3df3d` passed all 284 tests against pinned MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`. Final exact-head CI must remain green after documentation/receipt updates, and independent Verification should replay that final head before Director integration.

Unit regressions cover single-axis in-place rotation, multi-axis composition, compose reuse, malformed/unknown/no-op/inactive progression, non-finite generated state, multidimensional cancellation collisions, and preservation of the active-axis distinctness rule. Runtime conformance covers real current-core compilation and proves emitted rotation expressions change compiled geometry relative to a fixed-rotation control. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Scalar/vector step/base coercion, multidimensional grid-setting/grid-size/grid-scale progression, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
