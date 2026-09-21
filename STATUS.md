# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `09d3b1a96a5f62adc9c41870e513ce56d2370966`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified and integrated convergence/correctness work through Form PR #42. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

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
- repeat numeric-vector and emitted-vector expression arithmetic converged on the repeat kernel;
- all established grid progression lanes share the canonical axis-aligned generated-position representation;
- downstream grid size/scale/setting proofs reuse one owner-provided grid-rotation representation;
- grid scale owner and downstream setting proofs reuse one owner-provided scalar/vector/static generated grid-scale representation;
- grid and repeat validation-only movement are centralized in their progression kernels and remain non-emitting;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — repeat scale generated-state convergence

This candidate adds no public syntax or geometry capability. Repeat definition-scale behavior still interpreted authored/default scale state in two places: the scale owner reconstructed scalar/vector base and delta state for finite/positivity proof and emission, while the complete authored-state distinctness proof independently reconstructed scalar/vector/static/default generated scale state.

The Form-owned `repeat-scale-state.js` module now provides one deterministic internal representation of repeat scale state. `scaleStateFromRepeat(repeat)` preserves scalar, vector, static and omitted-unit defaults without taking validation authority; `generatedScaleFromRepeat(repeat, index)` produces the numeric scale state used by complete-state proof. The scale owner consumes the same base/delta representation for its existing finite/positivity proof and expression emission, while `repeat-distinctness.js` consumes the generated-state representation instead of reinterpreting scale semantics.

Compatibility checks, positivity/finite rules, recipe emission, setting ordering, complete-state distinctness authority, public intent shape and established HOLD wording remain in their existing owners. The state helper intentionally does not pre-empt malformed scalar/vector compatibility: the scale lane continues to reject those cases with its existing contract.

This is behavior-preserving convergence, so no fabricated regression-first-red claim is made. Focused coverage pins scalar/vector/static/default state, deterministic generated values, copied output and caller-input immutability, plus the boundary that representation does not steal compatibility-validation authority. Inherited repeat scale/distinctness/composition/runtime-conformance tests remain the public behavior evidence surface. Exact candidate-head CI must be green before independent Verification.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns recipe loops, lexical loop variables, expression evaluation, definition use and geometry execution. The repeated rule is producer-side interpretation of Form-owned repeat scale intent; no missing universal representation/runtime primitive was demonstrated.

MorphTile core PR #17 remains the occupied intentionally-red repeat lexical-scope presentation HOLD and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- changing the central base-grid validator merely to remove compatibility scaffolding;
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
