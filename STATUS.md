# Status

- Foundation version: 0.2.0
- State: CANDIDATE — CI REQUIRED ON EXACT HEAD
- Local test command: npm test
- Pinned runtime-tested MorphTile target remains: v0.4 at 13d83a2b2c0d12644442d3d9e45bcbe0af19876a
- Current MorphTile main primitive vocabulary: source-inspected only
- Envelope: provisional v0.1
- Visual proof: none

## Implemented in this candidate

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available.

## Evidence boundary

Local tests exercise deterministic mapping, request immutability, supported primitive names, bounded parameters, invalid-parameter HOLD behavior, unsupported-form HOLD behavior, and the existing recipe path. These claims become TESTED for this exact head only when CI reports green.

## HELD / open

No arbitrary geometry generation, cross-repo runtime MorphTile execution, autonomous form invention, or visual proof.

No claim of autonomous creation, production readiness, canon, or visual quality is made.
