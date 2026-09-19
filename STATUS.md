# Status

- Foundation version: 0.2.0
- State: STACKED CANDIDATE — EXACT-HEAD CI REQUIRED
- Local test command: npm test
- Pinned runtime target: v0.4 at 13d83a2b2c0d12644442d3d9e45bcbe0af19876a
- Current MorphTile main: six commits ahead of the pin; primitive mesh vocabulary remains source-compatible in the inspected mesh compiler, but current-main runtime conformance is not claimed
- Envelope: provisional v0.1
- Visual proof: none

## Implemented in the parent candidate

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available.

## Added in this stacked candidate

- CI checks out the exact MorphTile runtime commit declared in `machine.json`.
- Runtime conformance tests execute every emitted primitive through real MorphTile `createTile`, `validateTile`, and `compileMesh`.
- Exact primitive triangle/position receipts make compiler drift visible.
- One genuinely composed three-part recipe fixture executes through MorphTile's real recipe compiler with a bounded exact receipt.
- The test fails if CI runtime identity drifts away from `machine.json`.

## Placement

This is Form Machine conformance machinery, not a MorphTile-core change. Inspection of current MorphTile main found no missing universal geometry representation needed for this lane; the existing primitive and recipe substrate is sufficient.

## Evidence boundary

The stacked candidate only earns pinned-runtime compatibility when GitHub Actions is green on its exact head. Current MorphTile main is newer and remains outside the compatibility claim until separately tested.

## HELD / open

No arbitrary geometry generation, current-main runtime compatibility, autonomous form invention, automatic recipe synthesis, or visual proof.

No claim of production readiness, canon, or visual quality is made.
