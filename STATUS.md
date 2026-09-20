# Status

- Foundation version: 0.9.0
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at ef2b3c6986aa1a333247feffc43a8443f17239d0
- Envelope: provisional v0.1
- Visual proof: none

## Implemented on main before this candidate

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

## Added in this candidate

- Definition-instance `intent.repeat` may now include `with_step`, a bounded 1..32 map of finite numeric setting deltas.
- Every stepped key must already have a finite numeric base in `instance.with`; the machine does not invent definition defaults or setting names.
- At least one delta must be non-zero, and primitive targets cannot use `with_step`.
- Each stepped setting compiles to `base + i * delta` using the existing fixed repeat-loop index; callers still do not author arbitrary expression trees.
- Existing non-stepped settings remain fixed, definition resolution stays runtime-visible, and malformed/no-op progressions HOLD.
- Exact runtime conformance checks that three repeated `panel` definition instances deterministically compile with width spans 1, 2 and 3 when exact-head CI is green.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already accepts expression-valued recipe numbers and evaluates definition `with` settings in the active recipe scope, including repeat-loop variables. The missing rule was a bounded creation-side vocabulary for a common parameter progression without exposing the generic expression language.

Dependency closure and provenance remain Assembly Machine concerns. Surface/color remains Surface Machine territory.

## Evidence boundary

The candidate earns repeat-setting-progression and current-runtime claims only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed.

## HELD / open

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, multidimensional grid-setting progression, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
