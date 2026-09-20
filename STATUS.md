# Status

- Foundation version: 0.9.0
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at 26b89a77f6a90715a6742dc4d084008ba63731b6
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

## Current candidate: merged-core compatibility re-pin

MorphTile core has now integrated the universal recipe rule originally exposed by Form review: omitted optional numeric values may retain their existing defaults, but present recipe expressions that evaluate to non-finite numeric meaning HOLD with `HOLD_RECIPE_NONFINITE_VALUE`.

This candidate moves Form Machine's exact runtime pin from the pre-integration core to current MorphTile main `26b89a77f6a90715a6742dc4d084008ba63731b6` and adds a focused receiver probe for the caller-recipe escape hatch. The probe preserves the caller-owned recipe in Form output, then requires real MorphTile compilation to expose `HOLD_RECIPE_NONFINITE_VALUE` rather than silently substituting an ordinary geometry default.

No Form request vocabulary or version is widened by this evidence update.

## Placement

The non-finite runtime rule belongs in MorphTile core and is now integrated there. Form Machine owns finite-domain checks for the bounded expressions it generates and exact compatibility evidence for the public runtime it targets. It does not duplicate generic recipe-expression validation.

Dependency closure and provenance remain Assembly Machine concerns. Surface/color remains Surface Machine territory.

## Evidence boundary

The candidate earns current-core compatibility only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed. A green core main workflow by itself is not Form compatibility evidence; Form's own exact-head workflow must execute against the pinned core.

## HELD / open

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, multidimensional grid-setting progression, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
