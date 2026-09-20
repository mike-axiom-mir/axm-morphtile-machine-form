# Status

- Foundation version: 0.4.0
- State: STACKED CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: v0.4 at 4346df01ed18cd1336064f9323d7766ff4f6338a
- Current MorphTile main observed for this candidate: exactly the runtime pin above
- Envelope: provisional v0.1
- Visual proof: none

## Implemented in parent candidates

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available.
- Pinned-runtime conformance executes emitted primitives and caller/normalized compositions through real MorphTile create/validate/compile contracts.
- `intent.parts` provides bounded deterministic flat composition for 1..64 primitive parts.

## Added in this stacked candidate

- `intent.repeat` provides a compact bounded parametric repeat lane for one normalized primitive.
- Repeat count is bounded to 1..64.
- Translation step is a required finite 3-vector and may not be all zero, preventing accidental same-location duplicate geometry.
- Repeat and nested primitive fields fail closed on unknown or malformed input.
- The machine emits MorphTile's existing deterministic recipe-loop expressions instead of manually expanding repeated copies.
- Composition modes (`recipe`, `parts`, `repeat`) are mutually exclusive.
- Runtime conformance advances to MorphTile `4346df01ed18cd1336064f9323d7766ff4f6338a`, observed as current main for this candidate, and adds an exact repeat receipt.

## Placement

This belongs in Form Machine, not MorphTile core. MorphTile already has the universal deterministic recipe loop and expression substrate. The missing capability was a small creation-side vocabulary that safely compiles a common repeated-form request into that substrate.

## Evidence boundary

The candidate earns current-runtime and repeat claims only when GitHub Actions is green on its exact head. Future MorphTile commits remain unproven until separately executed.

## HELD / open

No arbitrary geometry generation, autonomous form invention, nested/general loop synthesis, conditions, arbitrary expression synthesis, definition reuse, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
