# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `969d802b4150d0b8f1e819bed1e8d13225fb273c`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified and integrated convergence/correctness work through Form PR #40. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

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
- downstream grid size/scale/setting proofs reuse one owner-provided grid-rotation representation;
- definition-setting proof reuses one owner-provided scalar/vector/static generated grid-scale representation;
- grid and repeat validation-only movement are centralized in their progression kernels and remain non-emitting;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — grid scale owner-state convergence

The current candidate adds no public syntax or geometry capability. After Form PR #40 independently established and integrated `generatedScaleFromGrid(grid, index)` as the canonical internal generated-scale representation, the scale owner's own complete Cartesian finite/distinctness proof was still independently rebuilding the same scalar/vector generated scale arithmetic.

`grid-scale.js` now consumes the integrated `generatedScaleFromGrid` representation inside that proof instead of retaining a second arithmetic implementation. Scalar/vector base compatibility, positivity semantics, scale width, emitted expressions, complete-state proof ownership, and existing HOLD wording remain local to the scale lane. The shared state helper remains non-emitting and assumes the scale contract has already been validated by its owning lane.

This is behavior-preserving convergence, so no regression-first-red claim is made. The integrated scale-state kernel tests and inherited public grid-scale/grid-setting/runtime-conformance suite remain the evidence surface; exact candidate-head CI must be green before independent Verification.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns recipe loops, lexical loop variables, expression evaluation, definition use, and geometry execution. This candidate only removes duplicate producer-side arithmetic after the Form-owned generated scale representation was independently verified and integrated.

MorphTile core PR #17 remains the occupied intentionally-red repeat lexical-scope presentation HOLD and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- changing the central base-grid validator merely to remove compatibility scaffolding;
- generalizing single-consumer repeat owner-state helpers merely for symmetry;
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
