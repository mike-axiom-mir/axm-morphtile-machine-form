# Status

- Foundation version: 0.19.0
- State: INTEGRATED FOUNDATION + DRAFT INTERNAL-CONVERGENCE CANDIDATE
- Integrated Form baseline: `d83b9c92a90c71f0b0be62bdf63bd903387cfa01`
- Local test command: `npm test`
- Pinned runtime target: MorphTile v0.4 at `2bdf8eade1376055473b9cc1b11734b72a5566e5`
- Envelope: provisional v0.1
- Visual proof: none

## Integrated foundation

The current main branch includes the bounded 0.19.0 Form vocabulary plus the independently reviewed internal convergence and correctness work through Form PR #31. Public intent remains bounded to explicit primitives, flat parts, direct/repeat/grid mixed composition, reusable definition instances, and the already-established repeat/grid progression rules.

Integrated behavior includes:

- explicit primitive vocabulary: box, sphere, cylinder, cone, wedge, plane;
- fail-closed primitive-local parameters and unknown-form handling;
- bounded `intent.parts`, `intent.instances`, `intent.repeat`, `intent.grid`, and `intent.compose`;
- bounded repeat setting, rotation, primitive-size, and definition scalar/vector-scale progression;
- bounded per-axis grid rotation, primitive-size, definition-scale, and definition-setting progression;
- in-place repeat/grid progression only when independently validated authored state changes;
- complete bounded generated-state proof for repeat/grid progressions, including floating-point duplicate-state collapse;
- shared deterministic repeat/grid progression arithmetic kernels;
- descriptor-safe caller-input preflight and prototype-independent authored definition-setting storage;
- pinned-current-core conformance through MorphTile public create/validate/compile contracts.

The integrated foundation does not claim visual uniqueness merely because authored state differs. Symmetric geometry, unused external definition settings, or semantically equivalent values can still render alike.

## Current draft candidate — base repeat kernel convergence

The current draft candidate does not add public syntax. It removes remaining duplicate one-dimensional repeat arithmetic in the central form vocabulary by routing base repeat translation and definition `with_step` progression through the existing `repeat-progression` kernel.

The candidate preserves existing public behavior:

- repeat translation still proves every generated coordinate remains finite before emission;
- definition `with_step` still requires matching finite numeric bases and at least one non-zero delta;
- emitted expressions remain the exact fixed-index `base + i * delta` representation;
- existing HOLD codes and finite-domain detail strings remain stable;
- complete repeat generated-state distinctness remains owned by the already-integrated `repeat-distinctness` layer;
- grid behavior is deliberately unchanged in this candidate.

Focused regressions pin canonical expression reuse, deterministic output, caller immutability, and legacy overflow HOLD details. Exact-head CI and independent Verification are required before Director integration. No self-merge is authorized by this repository status.

## Placement

This candidate belongs in Form Machine, not MorphTile core. Current MorphTile already owns compact recipe loops, lexical loop variables, expression evaluation, definition use, and runtime geometry execution. The change consolidates producer-side arithmetic; it does not demonstrate a missing universal representation/runtime primitive.

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
