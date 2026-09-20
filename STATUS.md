# Status

- Foundation version: 0.14.0
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
- Definition repeats may include bounded scalar `scale_step`; the complete positive finite generated scale domain is proved before emission.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The complete caller-authored request is descriptor-safe preflighted before normalization/JSON transport; non-portable values, accessors, serialization hooks and live/revoked Proxies fail closed without caller execution.
- Definition-instance `with` settings use prototype-independent storage so authored own keys remain data rather than host-language prototype behavior.

## 0.14.0 candidate — bounded vector definition repeat scale progression

MorphTile definition recipe `use` parts already accept vector scale whose components may be recipe expressions. Form 0.13 exposed only uniform scalar repeat scale progression, so anisotropic growth/shrink of a reusable multi-part definition still required the expert arbitrary-recipe lane even though the receiver substrate already represented it.

This candidate extends `repeat.scale_step` with one bounded vector form:

- scalar `scale_step` keeps the existing 0.13 semantics and requires scalar `instance.scale` or omitted unit scale;
- vector `scale_step` is exactly three finite numbers and at least one axis must change;
- vector progression requires vector `instance.scale`, or omitted scale which maps to MorphTile's exact implicit unit vector `[1,1,1]`;
- scalar-base/vector-step and vector-base/scalar-step mixing remains HELD instead of silently inventing broadcasting semantics;
- repeat count must be at least two;
- every generated component `base[axis] + i * delta[axis]` is checked across the complete bounded repeat domain before emission;
- every generated component must remain finite and strictly positive;
- zero-delta axes stay as their exact base values instead of producing unnecessary expression trees;
- vector scale progression reuses the same repeat path inside `intent.compose`;
- pinned-runtime conformance resolves a real definition and proves vector-changing output compiles to finite geometry different from an equivalent fixed-vector-scale repeat.

This candidate does not add primitive scale progression, grid-axis scale progression, scalar/vector type coercion, arbitrary caller-authored expressions, radial/trigonometric placement, recursive bodies, custom loop variables, conditions or autonomous geometry invention.

## Placement

Vector `scale_step` belongs in Form Machine, not MorphTile core. Current MorphTile already interprets definition-use vector scale by evaluating each vector component in recipe scope and applying the resulting X/Y/Z factors to resolved definition geometry. The missing capability is therefore producer vocabulary and pre-emission closure proof, not a universal representation/runtime primitive.

No MorphTile-core candidate is justified by this change.

## Evidence boundary

Regression-first evidence must show merged Form 0.13 holds a vector `scale_step` request before the capability exists. The final 0.14 candidate earns technical validity only if GitHub Actions is green on its exact head against MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

Unit regressions cover explicit vector progression, implicit unit-vector base, compose reuse, malformed/non-finite/no-op vectors, target/type mismatches, generated non-positive components and generated overflow. Runtime conformance must resolve a real definition through the exact pinned core and prove both scalar and vector changing-scale outputs compile to finite geometry distinct from fixed controls.

Independent Verification should replay the final exact candidate head before Director integration. Visual/aesthetic quality remains outside these receipts.

## HELD / open

Independent Verification of the final exact candidate head.

Primitive `scale_step`, scalar/vector step/base coercion, multidimensional grid-setting/grid-rotation/grid-size/grid-scale progression, arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, automatic definition discovery, visual proof, aesthetic acceptance and production readiness remain held.

No claim of production readiness, CANON, or visual quality is made.
