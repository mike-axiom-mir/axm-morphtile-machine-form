# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `d4da0515c290b0b504c02b9d29e974d3add4e6b5`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified convergence and correctness work through Form PR #35. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

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
- all established grid progression lanes now share the canonical axis-aligned generated-position representation;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — grid progression validation movement convergence

The current draft candidate does not add public syntax or geometry capability. It centralizes the private validation-only movement used when a stationary grid axis is legitimately distinguished by rotation, primitive-size, definition-scale, or definition-setting progression.

`grid-progression.js` now owns one bounded `progressionValidationStep(step, counts, deltas)` primitive. Rotation, size, scale, and setting grid normalizers consume that helper instead of independently rewriting stationary active axes to validation movement. The helper only acts on structurally valid three-axis inputs, copies caller-owned step state, changes only zero-translation axes with more than one cell and an active progression, and never emits candidate matter itself. Existing progression layers remain responsible for proving the complete authored state and restoring/emitting the actual authored position expressions.

A regression-first kernel test pins active-axis bounds, one-cell-axis non-leakage, scalar progression handling, malformed structural decline, and caller-input immutability. The inherited suite continues to cover the public rotation/size/scale/setting progression behavior and pinned MorphTile receiver contract.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns compact recipe loops, lexical loop variables, expression evaluation, definition use, and runtime geometry execution. The candidate only converges producer-side validation scaffolding that exists because Form layers preserve the established base-grid validation contract.

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
