# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `565798b682b60907ecea91a646df1bbb35157a28`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main baseline includes the bounded 0.19.0 Form vocabulary plus independently verified and integrated convergence/correctness work through Form PR #43. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

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
- repeat scale owner and complete-state proof reuse one scalar/vector/static/default generated-scale representation;
- all established grid progression lanes share the canonical axis-aligned generated-position representation;
- downstream grid size/scale/setting proofs reuse one owner-provided grid-rotation representation;
- grid scale owner and downstream setting proofs reuse one owner-provided scalar/vector/static generated grid-scale representation;
- grid and repeat validation-only movement are centralized in their progression kernels and remain non-emitting;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs.

## Current draft candidate — repeat setting generated-state convergence

This candidate adds no public syntax or geometry capability. Repeat definition-setting progression still interpreted the same authored setting map and `with_step` deltas in two places: the setting owner built emitted loop expressions, while the complete authored-state distinctness proof independently rebuilt generated numeric setting values and key ordering.

The Form-owned `repeat-setting-state.js` module now provides one deterministic internal interpretation for that state. `generatedSettingValues(baseSettings, withStep, index)` returns generated values in canonical sorted setting-key order. `settingExpressionState(baseSettings, withStep)` produces the emitted bounded loop-expression state while preserving caller data and exact own-key identity, including `__proto__` as data rather than prototype authority.

The existing setting owner still validates allowed setting names, matching authored bases, finite numeric deltas, finite closure, non-zero effect, target kind and repeat count before asking the representation helper to emit state. The complete-state proof consumes the same generated-state interpretation rather than rebuilding default-zero deltas and key ordering itself. Unknown/unowned deltas remain outside representation authority and are rejected by the existing setting owner before candidate emission.

A specification-first focused test intentionally failed before the helper existed. The implemented candidate then passed the full Form suite against the pinned MorphTile receiver. Focused coverage pins canonical ordering, deterministic replay, caller immutability, exact own-key `__proto__` handling and the boundary that representation does not take validation authority. Existing repeat-setting, distinctness, own-key and runtime-conformance tests remain the public behavior evidence surface.

## Placement

This candidate belongs in Form Machine, not MorphTile core. MorphTile already owns recipe loops, lexical loop variables, expression evaluation, definition use and geometry execution. The repeated rule is producer-side interpretation of Form-owned repeat setting intent; no missing universal representation/runtime primitive was demonstrated.

MorphTile core PR #17 remains the occupied intentionally-red repeat lexical-scope presentation HOLD and is not duplicated here.

## HELD / not proven

- independent Verification of the final exact candidate head before Director integration;
- changing the central base-grid validator merely to remove compatibility scaffolding;
- arbitrary recipe-language, condition, or caller-authored expression synthesis;
- radial or other new layout operators without repeated grounded creation evidence;
- automatic definition discovery or dependency closure;
- semantic/range inference for arbitrary external definition settings;
- autonomous geometry invention;
- visual/aesthetic acceptance or production readiness;
- compatibility beyond the exact pinned MorphTile commit;
- CANON.

No claim of production readiness or visual quality is made.
