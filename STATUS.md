# Status

- Foundation version: 0.18.0
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
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.18.0 candidate — bounded per-axis definition grid scale progression

The repeat lane already had bounded scalar/vector definition `scale_step`, while the grid lane already had fixed `gx`, `gy`, and `gz` loop variables plus bounded per-axis rotation. Current MorphTile already evaluates expression-valued definition-use scale in recipe scope. The remaining machine gap was a bounded multidimensional producer rule for whole reusable-form scale progression.

This candidate adds optional definition-only `grid.scale_step`:

- `scale_step` is keyed only by `x`, `y`, or `z`;
- each provided axis carries either one finite non-zero scalar delta or exactly three finite vector deltas with at least one changed component;
- all provided grid axes must use the same scalar/vector representation;
- scalar progression requires scalar `instance.scale` or omitted unit scale;
- vector progression requires vector `instance.scale` or omitted unit vector `[1,1,1]`;
- scalar/vector base-step coercion and mixed scalar/vector grid axes HOLD rather than inventing broadcast semantics;
- each provided scale-progression axis must have at least two cells;
- a definition grid axis may remain translation-stationary when that same axis owns validated scale progression;
- active axes with neither translation nor their own rotation/scale progression still HOLD;
- scale and existing rotation progression may coexist and share the fixed `gx`/`gy`/`gz` variables;
- every generated scale component across the complete bounded Cartesian domain must remain finite and strictly positive;
- the complete generated position+rotation+scale authored-state domain must remain distinct, including non-adjacent cross-axis cancellation;
- standalone `intent.grid` and grid blocks inside `intent.compose` share the exact same rule;
- primitive grids reject `scale_step` and continue to use primitive `size_step` instead;
- pinned-runtime conformance requires current MorphTile to resolve a real definition, consume multi-axis per-cell scale expressions with simultaneous rotation, compile four finite recipe parts, and differ from a fixed-scale control.

This is an authored-state rule, not a visual uniqueness claim. Different scale/rotation states can still look equivalent for some symmetric or externally defined matter.

## Placement

This belongs in Form Machine, not MorphTile core. Current MorphTile already owns definition `use`, expression-valued scale, nested recipe loops, loop variables and expression evaluation. The missing piece was bounded creation vocabulary plus producer-side Cartesian-domain proof.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first head `53ef8211f1876f807627978a2be73d090113b7cb` intentionally failed before the capability existed; PR-triggered Actions run `35555607978` completed FAILURE.

Functional implementation head `f685894d1b9c325159aa088bb2d47bcc4fae832f` then passed PR-triggered Actions run `35555720791`, including `npm test` against pinned MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

Final exact-head CI must remain green after version/documentation receipts, and independent Verification should replay that exact head before Director integration.

Unit regressions cover stationary-axis scalar scale progression, multi-axis vector progression with rotation, compose reuse, malformed/no-op/inactive/wrong-target inputs, scalar/vector mismatch and mixed-axis representation rejection, non-positive generated scale, finite-authored overflow, cross-axis Cartesian collision, and preservation of the active-axis distinctness rule. Runtime conformance covers real current-core definition resolution and compares changing-scale output with a fixed-scale control. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Multidimensional grid definition-setting progression, scalar/vector coercion or broadcasting, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
