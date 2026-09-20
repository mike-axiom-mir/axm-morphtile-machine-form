# Status

- Foundation version: 0.6.0
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at b6b086edb70fd4657495fcf01cb9fcdedceafdaf
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
- `intent.instances` provides bounded deterministic reuse of 1..64 existing MorphTile definitions through recipe `use` parts.
- Intent modes fail closed on fields they would otherwise ignore.

## Added in this candidate

- `intent.grid` provides a bounded axis-aligned 1D/2D/3D grid for one normalized primitive or definition instance.
- `counts` is a three-integer X/Y/Z cell vector; `step` is a finite X/Y/Z spacing vector.
- Total cells are bounded to 2..64 and any repeated axis requires a non-zero step, preventing silent same-location duplicates.
- Single-cell axes are omitted; active axes compile into MorphTile's existing nested recipe-loop substrate with fixed `gx`, `gy`, `gz` loop variables.
- Primitive and definition targets reuse the same existing normalization rules, including definition `with`, transforms and scale.
- Unknown grid fields, malformed counts/steps, ambiguous targets, oversized grids and ambiguous simultaneous composition modes HOLD rather than being guessed.
- Runtime conformance targets MorphTile `b6b086edb70fd4657495fcf01cb9fcdedceafdaf` and checks exact primitive-grid and definition-grid geometry receipts when exact-head CI is green.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already has universal nested recipe loops, loop-variable scope, definition `use`, transforms, depth/budget HOLDs and deterministic mesh compilation. The missing rule was creation-side normalization of a common grid request.

Dependency closure and provenance remain Assembly Machine concerns. Surface/color remains Surface Machine territory.

## Evidence boundary

The candidate earns bounded-grid and current-runtime claims only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed.

## HELD / open

No arbitrary geometry generation, autonomous form invention, general nested-loop synthesis beyond the fixed grid rule, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
