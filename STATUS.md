# Status

- Foundation version: 0.9.0
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at 429a344f7d9333bef01cf9de1c292c3af09abec2
- Envelope: provisional v0.1
- Visual proof: none

## Implemented on main

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
- Every stepped key must already have a finite numeric base in `instance.with`; the machine does not invent definition defaults or setting names.
- Each stepped setting compiles to `base + i * delta` using the fixed repeat-loop index; callers still do not author arbitrary expression trees.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.

## Current candidate: merged mesh-finite core compatibility re-proof

MorphTile core has now integrated the universal compiled-geometry rule exposed from the Form lane: finite authored values do not guarantee finite derived mesh coordinates. Current core fails closed with `HOLD_MESH_NONFINITE_VALUE` and clears partial `P/T/K` if mesh compilation produces non-finite positions.

This candidate advances Form Machine's exact runtime pin from `26b89a77f6a90715a6742dc4d084008ba63731b6` to current MorphTile main `429a344f7d9333bef01cf9de1c292c3af09abec2`. It keeps Form Machine at v0.9.0 and does not widen the request vocabulary.

The receiver proof now covers both runtime truth boundaries relevant to Form output:

- caller-owned recipe expressions that evaluate non-finite -> `HOLD_RECIPE_NONFINITE_VALUE`;
- an ordinary bounded Form primitive whose finite authored position + size combination overflows during mesh arithmetic -> `HOLD_MESH_NONFINITE_VALUE` with empty `P/T/K`.

A large finite primitive position + size control remains accepted and compiles to finite positions, so the new mesh receipt is not blanket rejection.

## Placement

Generic recipe-expression meaning and derived mesh finiteness belong in MorphTile core. Form Machine owns finite-domain checks for bounded expressions it generates, normalization of finite authored form intent, and exact compatibility evidence for the public runtime it targets. It does not duplicate the core mesh arithmetic guard.

Dependency closure and provenance remain Assembly Machine concerns. Surface/color remains Surface Machine territory.

## Evidence boundary

The candidate earns current-core compatibility only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed. A green core main workflow by itself is not Form compatibility evidence; Form's own exact-head workflow must execute against the pinned core.

## HELD / open

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, multidimensional grid-setting progression, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
