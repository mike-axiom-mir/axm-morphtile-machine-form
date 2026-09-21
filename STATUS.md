# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `379b25f35f90ad6998c7967d3b112478186540f0`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified convergence and correctness work through Form PR #33. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

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
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — shared grid position arithmetic

The current draft candidate does not add public syntax or geometry capability. It removes repeated axis-aligned grid-position reasoning that remained after the progression-kernel work and after independent Verification accepted the base-grid precision fix in PR #33.

A new internal `axisAlignedVectorDeltas(step, counts)` primitive now gives ordinary grid translation one canonical representation. It deliberately suppresses inactive one-cell axes and zero movement, so generated recipe matter never references a loop variable that does not exist.

The candidate reuses that representation in:

- central base-grid recipe position emission and the canonical `gx`/`gy`/`gz` loop vocabulary;
- the final translation-only base-grid distinctness proof;
- rotation-grid complete-state proof and emitted positions;
- primitive-size grid complete-state proof and emitted positions;
- definition-scale grid complete-state proof and emitted positions.

Existing finite-domain validation, HOLD codes/details, compact loop structure, progression semantics, complete-state duplicate rules, deterministic replay, and caller-input immutability are preserved. Definition-setting grid semantics are intentionally unchanged in this candidate; their existing path remains covered by the inherited suite but its private position mapping was not widened into this refactor.

Regression-first internal-kernel specification head `dd4ac90909e3e455a8fe2a6ee3ca89ea497074b1` failed before the helper existed in Actions run `35585934165`. Functional convergence head `ebc131ecbc8deea90572a2fd4509ff20d05fd58c` passed Actions run `35586285896`, including the full `npm test` suite against the pinned runtime target.

Focused coverage pins inactive-axis omission, canonical base-grid expressions, progression-bearing grid position equivalence, deterministic replay, caller immutability, and the pre-existing base-grid overflow HOLD detail.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns compact recipe loops, lexical loop variables, expression evaluation, definition use, and runtime geometry execution. This is producer-side arithmetic convergence after a verified Form correctness change, not evidence of a missing universal representation/runtime primitive.

The separate MorphTile-core repeat lexical-scope presentation HOLD remains an occupied core lane and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- definition-setting grid position-internal convergence beyond existing verified behavior;
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
