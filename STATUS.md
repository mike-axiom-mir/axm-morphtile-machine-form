# Status

- Foundation version: 0.8.0
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
- `intent.compose` v0.7 combines direct primitive and definition targets in one ordered recipe.
- Intent modes fail closed on fields they would otherwise ignore.

## Added in this candidate

- `intent.compose` may now contain the existing bounded `repeat` and `grid` blocks alongside direct primitive and definition targets.
- Pattern blocks call the same standalone repeat/grid normalizers; there is no separate permissive nested-loop vocabulary.
- A cumulative 64-requested-placement budget covers direct, repeat and grid blocks so compact syntax cannot hide unbounded expansion.
- Definition references inside repeat/grid blocks preserve the explicit runtime-resolution warning.
- Recursive compose blocks, ambiguous block kinds, malformed pattern blocks and unknown fields HOLD instead of being guessed.
- Exact runtime conformance checks a direct plane + three-plane repeat + 2x2 plane grid as eight deterministically compiled recipe parts when exact-head CI is green.
- Version history metadata now records the already-integrated v0.7 mixed-composition step that the prior changelog/status had not yet captured.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already has universal recipe parts, nested deterministic repeat loops, loop-variable scope, definition `use`, transforms, depth/budget HOLDs and deterministic mesh compilation. The missing rule was creation-side composition of already-bounded form operators.

Dependency closure and provenance remain Assembly Machine concerns. Surface/color remains Surface Machine territory.

## Evidence boundary

The candidate earns direct + pattern composition and current-runtime claims only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed.

## HELD / open

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
