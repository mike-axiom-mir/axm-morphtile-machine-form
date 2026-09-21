# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `58a9c272257fed179b0136671c2fcfb42ac7dfe2`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified convergence and correctness work through Form PR #34. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

Integrated behavior includes:

- explicit primitive vocabulary: box, sphere, cylinder, cone, wedge, plane;
- bounded `intent.parts`, `intent.instances`, `intent.repeat`, `intent.grid`, and `intent.compose`;
- bounded repeat setting, rotation, primitive-size, and definition scalar/vector-scale progression;
- bounded per-axis grid rotation, primitive-size, definition-scale, and definition-setting progression;
- in-place repeat/grid progression only when independently validated authored state changes;
- complete generated-state proof for repeat and grid progression lanes, including floating-point duplicate-state collapse;
- base-grid generated-position distinctness proof for ordinary translation-only grids;
- shared deterministic repeat/grid progression arithmetic kernels;
- central base-repeat arithmetic converged on the repeat kernel;
- base-grid, rotation-grid, primitive-size-grid, and definition-scale-grid position arithmetic converged on one axis-aligned grid-position representation;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — definition-setting grid position convergence

The current draft candidate does not add public syntax or geometry capability. It completes the remaining evidenced axis-aligned position convergence in the definition-setting grid lane after Form PR #34 established the shared `axisAlignedVectorDeltas(step, counts)` representation.

`grid-settings.js` now reuses that shared representation for both complete generated-state proof and emitted position expressions. Definition-setting semantics remain local: exact own-key setting identity, numeric setting bases/deltas, scale/rotation composition, HOLD behavior, and complete-state duplicate detection are unchanged.

A focused convergence regression pins canonical position expressions, inactive one-cell-axis omission, setting progression composition, deterministic replay, and caller-input immutability.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns compact recipe loops, lexical loop variables, expression evaluation, definition use, and runtime geometry execution. This is producer-side arithmetic convergence after verified Form work, not evidence of a missing universal representation/runtime primitive.

The separate MorphTile-core repeat lexical-scope presentation HOLD remains an occupied core lane and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- arbitrary recipe-language, condition, or caller-authored expression synthesis;
- radial or other new layout operators without repeated grounded creation evidence;
- automatic definition discovery or dependency closure;
- semantic/range inference for arbitrary external definition settings;
- scalar/vector coercion or broadcasting not already explicitly supported;
- autonomous geometry invention;
- visual/aesthetic acceptance or production readiness;
- compatibility beyond the exact pinned MorphTile commit;
- CANON.

No claim of production readiness or visual quality is made.
