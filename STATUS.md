# Status

- Foundation version: 0.3.0
- State: STACKED CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: v0.4 at 13d83a2b2c0d12644442d3d9e45bcbe0af19876a
- Current MorphTile main: newer than the runtime pin; current-main runtime conformance is not claimed
- Envelope: provisional v0.1
- Visual proof: none

## Implemented in parent candidates

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available.
- Pinned-runtime conformance executes emitted primitives and one caller-supplied composed recipe through real MorphTile create/validate/compile contracts.

## Added in this stacked candidate

- `intent.parts` provides a bounded deterministic composition lane for 1..64 flat primitive parts.
- Every part is normalized with the same primitive vocabulary and geometry parameter rules before the machine emits recipe matter.
- Unknown per-part fields HOLD instead of being silently ignored.
- Unsupported shapes, malformed parameters, empty/oversized compositions, and simultaneous `parts` + `recipe` requests HOLD explicitly.
- Surface/look fields such as color are not accepted by this Form Machine lane.
- Runtime conformance adds a normalized three-part composition fixture and requires it to compile to the same exact bounded receipt as the equivalent caller-supplied recipe.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already has the universal recipe representation/runtime needed to execute primitive parts. The missing capability was creation-side fail-closed normalization of a common composed-form request.

## Evidence boundary

The candidate earns its claims only when GitHub Actions is green on its exact head. The runtime pin remains unchanged until current MorphTile main is separately executed and proven.

## HELD / open

No arbitrary geometry generation, current-main runtime compatibility, autonomous form invention, loop/expression recipe synthesis, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
