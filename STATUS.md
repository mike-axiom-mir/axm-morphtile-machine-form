# Status

- Foundation version: 0.13.0
- State: CANDIDATE — EXACT-HEAD CI + INDEPENDENT REVIEW REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at 2bdf8eade1376055473b9cc1b11734b72a5566e5
- Envelope: provisional v0.1
- Visual proof: none

## Integrated behavior inherited by this candidate

- Explicit primitive form vocabulary: box, sphere, cylinder, cone, wedge, plane.
- Bounded validation for primitive-local geometry parameters.
- Unknown named forms HOLD instead of falling through to a box.
- Existing caller-supplied recipe mapping remains available with an explicit runtime-validation warning.
- Pinned-runtime conformance executes emitted primitives and compositions through real MorphTile create/validate/compile contracts.
- `intent.parts` provides bounded deterministic flat composition for 1..64 primitive parts.
- `intent.repeat` provides compact bounded parametric repetition for one normalized primitive or definition instance.
- `intent.grid` provides bounded axis-aligned 1D/2D/3D repetition for one normalized primitive or definition instance.
- `intent.instances` provides bounded deterministic reuse of 1..64 existing MorphTile definitions through recipe `use` parts.
- `intent.compose` combines direct primitive/definition targets and the bounded repeat/grid operators under one 64-placement request budget.
- Intent modes fail closed on fields they would otherwise ignore.
- Definition-instance repeat may include `with_step`, a bounded map of finite numeric setting deltas over the fixed repeat index.
- Primitive and definition repeats may include bounded `rot_step` progression over the same fixed repeat index.
- Primitive repeats may include bounded `size_step` progression; the complete positive finite generated size domain is proved before emission.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.13.0 candidate — bounded definition repeat scale progression

MorphTile definition recipe `use` parts already accept expression-valued `scale`, and Form already accepts bounded definition instances plus repeat translation, rotation and numeric setting progression. Repeated whole-form growth or shrink still required callers to use the expert arbitrary-recipe lane even though the substrate primitive already exists.

This candidate adds optional `repeat.scale_step` for definition-instance repeat targets. It is deliberately scalar-only and bounded:

- `scale_step` is one finite non-zero number;
- the target must be a definition instance; primitive repeats continue to use `size_step` for dimensions;
- repeat count must be at least two;
- the base may be an explicit positive finite scalar `instance.scale` or MorphTile's existing implicit unit scale when `scale` is omitted;
- vector base scale remains held rather than silently inventing vector-delta semantics;
- every generated `base scale + i * delta` value is checked across the complete bounded repeat domain before emission;
- every generated scale must remain finite and strictly positive;
- the emitted recipe uses `base + i * delta` over the existing fixed loop index `i` rather than caller-authored expressions;
- `scale_step` composes with existing definition `with_step` and target `rot_step` because they change separate normalized fields over the same already-bounded index;
- repeat blocks inside `intent.compose` reuse exactly the same scale progression rule;
- pinned-runtime conformance resolves a real definition and proves the changing-scale output compiles to finite geometry different from an equivalent fixed-scale repeat.

This candidate does not add vector scale progression, primitive scale progression, grid-axis scale progression, arbitrary caller-authored expressions, radial/trigonometric placement, recursive bodies, custom loop variables, conditions or autonomous geometry invention.

## Placement

`scale_step` belongs in Form Machine, not MorphTile core. Current MorphTile already evaluates recipe definition-use `scale` as either an expression-valued scalar or vector and applies it to the resolved definition mesh. The missing capability is a small producer vocabulary for a repeated reusable-form pattern, not a new universal representation/runtime primitive.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first evidence must show current Form holds authored `scale_step` as unsupported before the capability exists. The final candidate earns technical validity only if GitHub Actions is green on its exact head against MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

Unit regressions cover scalar progression, implicit unit scale, coexistence with `rot_step` and `with_step`, compose reuse, malformed/no-op input, primitive rejection, single-copy misuse, vector-base HOLD, non-positive generated scales and non-finite expansion. Runtime conformance must resolve a real definition through the exact pinned core and prove changing finite compiled geometry.

Independent Verification should replay the final exact candidate head before Director integration. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Vector `scale_step`, primitive `scale_step`, multidimensional grid-setting/grid-rotation/grid-size/grid-scale progression, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
