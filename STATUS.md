# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `32ffc491684b82165374e14618b197c39d84b474`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently integrated convergence and correctness work through Form PR #38. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

Integrated behavior includes:

- explicit primitive vocabulary: box, sphere, cylinder, cone, wedge, plane;
- bounded `intent.parts`, `intent.instances`, `intent.repeat`, `intent.grid`, and `intent.compose`;
- bounded repeat setting, rotation, primitive-size, and definition scalar/vector-scale progression;
- bounded per-axis grid rotation, primitive-size, definition-scale, and definition-setting progression;
- in-place repeat/grid progression only when independently validated authored state changes;
- complete generated-state proof for repeat and grid progression lanes, including floating-point duplicate-state collapse;
- base-grid generated-position distinctness proof for ordinary translation-only grids;
- shared deterministic repeat/grid progression arithmetic kernels;
- central base-repeat arithmetic and repeat linear finite-domain proof converged on the repeat kernel;
- all established grid progression lanes share the canonical axis-aligned generated-position representation;
- grid and repeat validation-only movement are centralized in their progression kernels and remain non-emitting;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — grid rotation state convergence

The current candidate adds no public syntax or geometry capability. It removes three downstream private reconstructions of already-validated `grid.rot_step` state from primitive-size, definition-scale, and definition-setting Cartesian proof paths.

`grid-rotation.js` now owns one deterministic `rotationDeltasFromGrid(grid)` representation using canonical x/y/z order and copied authored vectors. Downstream proof layers consume that owner-provided state instead of reinterpreting rotation progression themselves. Rotation validation, emitted recipe shape, complete-state proof ownership, size/scale/setting semantics, and existing HOLD wording remain local to their established layers.

A focused kernel regression pins canonical x/y/z state, inactive-axis representation, deterministic replay, and caller-input immutability. The inherited suite remains responsible for public grid rotation/size/scale/setting behavior and pinned MorphTile receiver conformance.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns recipe loops, lexical loop variables, expression evaluation, definition use, and geometry execution. The candidate only converges producer-side reuse of an already-validated Form rotation representation.

MorphTile core PR #17 remains the occupied intentionally-red repeat lexical-scope presentation HOLD and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- changing the central base-grid validator merely to remove compatibility scaffolding;
- generalizing target-specific scale or setting semantics merely for symmetry;
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
