# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `fa91b691c40cf418be1d17aa0baa323e38800333`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified and integrated convergence/correctness work through Form PR #41. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

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
- grid scale owner and downstream setting proofs reuse one owner-provided scalar/vector/static generated grid-scale representation;
- grid and repeat validation-only movement are centralized in their progression kernels and remain non-emitting;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — repeat vector generated-state convergence

The current candidate adds no public syntax or geometry capability. The repeat complete-state distinctness proof still rebuilt the same three-component `base + index * delta` arithmetic separately for position, rotation, primitive size, and vector instance scale even though repeat scalar arithmetic is already owned by `repeat-progression.js`.

The repeat progression kernel now owns `linearVector(base, index, deltas)` as the canonical immutable vector companion to `linearValue`. The complete-state proof consumes it for those four vector components while preserving scalar scale, definition-setting order, complete-state proof authority, emitted recipe expressions, and established HOLD behavior.

This is behavior-preserving convergence, so no regression-first-red claim is made. A focused kernel test pins generated vector values, copied output, and caller-input immutability; inherited repeat progression/distinctness/runtime-conformance tests remain the public behavior evidence surface. Exact candidate-head CI must be green before independent Verification.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns recipe loops, lexical loop variables, expression evaluation, definition use, and geometry execution. This candidate only removes repeated producer-side generated-vector arithmetic from a Form-owned proof.

MorphTile core PR #17 remains the occupied intentionally-red repeat lexical-scope presentation HOLD and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- changing the central base-grid validator merely to remove compatibility scaffolding;
- creating owner-state helper layers where there is not yet more than one evidence-backed consumer;
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
