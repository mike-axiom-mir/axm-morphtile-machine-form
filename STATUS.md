# Status

- Foundation version: 0.5.0
- State: CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at a579182ae585e5722ac87dd0cc8209963b18d000
- Envelope: provisional v0.1
- Visual proof: none

## Implemented on main before this candidate

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available with an explicit runtime-validation warning.
- Pinned-runtime conformance executes emitted primitives and compositions through real MorphTile create/validate/compile contracts.
- `intent.parts` provides bounded deterministic flat composition for 1..64 primitive parts.
- `intent.repeat` provides compact bounded parametric repetition for one normalized primitive.
- Intent modes fail closed on fields they would otherwise ignore.

## Added in this candidate

- `intent.instances` provides bounded deterministic reuse of 1..64 existing MorphTile definitions through recipe `use` parts.
- Each instance requires a bounded definition id and may carry finite `pos`, `rot`, positive `scale`, and up to 32 finite numeric `with` settings.
- `intent.repeat` can now compactly repeat either one primitive part or one bounded definition instance through the same existing MorphTile loop substrate.
- Unknown fields, malformed references/settings/transforms, ambiguous repeat targets, oversized instance sets, and ambiguous simultaneous composition modes HOLD instead of being guessed.
- Form Machine does not resolve or copy definition bodies. It emits references and states the runtime-resolution boundary explicitly.
- Runtime conformance advances to current observed MorphTile main `a579182ae585e5722ac87dd0cc8209963b18d000` and tests real definition resolution, parametric `with` overrides, compact repeated definition use, exact geometry receipts, determinism, and the visible no-world HOLD.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already has the universal recipe `use` and loop representations and runtime semantics for definition lookup, settings, transforms, recursion/depth limits, budget HOLDs, and missing-world HOLDs. The missing rule was creation-side normalization of common reuse/repeat requests.

Dependency closure and provenance remain Assembly Machine concerns. Surface/color remains Surface Machine territory.

## Evidence boundary

The candidate earns current-runtime and definition-reuse claims only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed.

## HELD / open

No arbitrary geometry generation, autonomous form invention, nested/general loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
