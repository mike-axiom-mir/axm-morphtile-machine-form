# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT GRID-CORRECTNESS CANDIDATE
- Integrated Form baseline: `dd6975f29390e3175642a7d510b3c5320415b620`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main branch includes the bounded 0.19.0 Form vocabulary plus independently reviewed internal convergence and correctness work through Form PR #32. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

Integrated behavior includes:

- explicit primitive vocabulary: box, sphere, cylinder, cone, wedge, plane;
- fail-closed primitive-local parameters and unknown-form handling;
- bounded `intent.parts`, `intent.instances`, `intent.repeat`, `intent.grid`, and `intent.compose`;
- bounded repeat setting, rotation, primitive-size, and definition scalar/vector-scale progression;
- bounded per-axis grid rotation, primitive-size, definition-scale, and definition-setting progression;
- in-place repeat/grid progression only when independently validated authored state changes;
- complete bounded generated-state proof for repeat and progression-bearing grids, including floating-point duplicate-state collapse;
- shared deterministic repeat/grid progression arithmetic kernels;
- central base-repeat translation and definition-setting arithmetic converged on the repeat progression kernel;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs. Symmetric geometry, unused external definition settings, or semantically equivalent values can still render alike.

## Current draft candidate — base-grid generated-position distinctness

The current draft candidate closes the remaining non-progression grid precision hole. A base grid previously treated a finite non-zero translation step as sufficient evidence that cells were distinct. At JavaScript number precision boundaries, `base + step` can equal `base` even when `step` is finite and non-zero, so ordinary grid cells could collapse onto the same authored position.

The candidate adds one final bounded base-grid proof using the existing Cartesian progression kernel:

- standalone `intent.grid` and grid blocks inside `intent.compose` share the same proof;
- every generated base-grid position must remain finite and distinct across the complete 2..64-cell Cartesian domain;
- a numeric duplicate state HOLDs as `HOLD_FORM_GRID_INVALID` before recipe matter is emitted;
- deterministic replay and caller-input immutability remain required;
- progression-bearing grids continue to use their existing complete authored-state proofs, so a collapsed translation component remains valid when another independently validated rotation/size/scale/setting progression distinguishes the complete state;
- no new public intent syntax, expression language, geometry primitive, or runtime authority is introduced.

Regression-first evidence is preserved on the candidate branch. Exact regression head `40c7dc2d48d5d3ca51d8221a981026fa1fbef43a` fails the new duplicate-state assertions on the integrated baseline; implementation evidence must be green at the final exact candidate head before review.

## Placement

This candidate belongs in Form Machine, not MorphTile core. Current MorphTile already owns compact recipe loops, lexical loop variables, expression evaluation, definition use, and runtime geometry execution. The missing rule is producer-side evidence that requested base-grid placements remain distinct after numeric evaluation, not a universal representation/runtime primitive.

The separate MorphTile-core repeat lexical-scope HOLD for expression-backed presentation labels remains an occupied core lane and is not duplicated here.

## HELD / not proven

- arbitrary recipe-language, condition, or caller-authored expression synthesis beyond the bounded rules;
- radial or other new layout operators without repeated grounded creation evidence;
- automatic definition discovery or dependency closure;
- semantic/range inference for arbitrary external definition settings;
- scalar/vector coercion or broadcasting not already explicitly supported;
- autonomous geometry invention;
- visual/aesthetic acceptance or production readiness;
- compatibility beyond the exact pinned MorphTile commit;
- CANON.

No claim of production readiness or visual quality is made.
