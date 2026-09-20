# Status

- Foundation version: 0.10.0
- State: CANDIDATE — EXACT-HEAD CI + INDEPENDENT REVIEW REQUIRED
- Local test command: npm test
- Pinned runtime target: MorphTile v0.4 at 429a344f7d9333bef01cf9de1c292c3af09abec2
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
- Definition-instance `intent.repeat` may include `with_step`, a bounded 1..32 map of finite numeric setting deltas.
- Every stepped key must already have a finite numeric base in `instance.with`; the machine does not invent definition defaults or setting names.
- Each stepped setting compiles to `base + i * delta` using the fixed repeat-loop index; callers still do not author arbitrary expression trees.
- Generated repeat/grid/progression expressions are checked over their complete bounded domain before emission so non-finite expansions HOLD in Form Machine.
- The exact integrated receiver proof targets MorphTile `429a344f7d9333bef01cf9de1c292c3af09abec2`, including `HOLD_RECIPE_NONFINITE_VALUE` and `HOLD_MESH_NONFINITE_VALUE` runtime boundaries.

## 0.10.0 candidate — authored geometry source integrity before transport

Form Machine previously normalized bounded form intent but still relied on JSON cloning while publishing results. The expert caller-recipe path deliberately leaves recipe semantics to MorphTile runtime; because those recipe objects were carried directly into the candidate before result cloning, caller-controlled accessors or `toJSON` hooks could execute during serialization, while non-finite numbers and other non-portable JavaScript values could be rewritten or dropped before the runtime ever saw the authored geometry.

This candidate performs a portable-data preflight over the complete caller request before any form normalization or result transport. It reads descriptors rather than invoking accessors, rejects JavaScript Proxy values before prototype/key/descriptor/array reflection, and applies the same ordering while deriving HOLD metadata. That includes revoked root Proxies, which must reach the explicit HOLD rather than escape through `Array.isArray` as an uncaught throw.

Typed outcomes:

- `HOLD_FORM_INPUT_NONFINITE_VALUE` for `NaN` or infinite authored numbers;
- `HOLD_FORM_INPUT_NONPORTABLE_VALUE` for values/structures portable JSON cannot preserve exactly, including `undefined`, functions (therefore caller `toJSON` hooks), symbols, bigint, `-0`, sparse/decorated arrays, accessors, symbol-keyed properties, cycles, non-plain objects, non-enumerable authored fields, and live or revoked JavaScript Proxy values.

Each HOLD carries the exact authored path and emits no candidate. Ordinary portable caller recipes continue through the existing expert recipe path unchanged, and MorphTile remains authoritative for the meaning/runtime validity of that portable recipe.

## Placement

This rule belongs in Form Machine, not MorphTile core. It protects Form's producer-side authored request before Form's own JSON-backed envelope/result transport can change it. MorphTile already owns portable recipe-expression meaning and compiled-mesh finiteness once geometry reaches the runtime.

Dependency closure and provenance aggregation remain Assembly Machine concerns. Surface/color remains Surface Machine territory. The same general source-integrity class has appeared in sibling machines, but this implementation is Form-owned because Form owns preservation of its authored geometry request.

## Evidence boundary

The candidate earns technical validity only if GitHub Actions is green on its exact head against the pinned MorphTile runtime. The regression-first commits remain useful failure evidence only; they are not production claims. Independent Verification should replay the final exact head, especially accessor and `toJSON` non-execution, live Proxy trap non-execution, revoked-root Proxy fail-closed behavior, non-finite recipe preservation failure, and an ordinary portable recipe control.

## HELD / open

Independent Verification of the final exact candidate head.

No arbitrary geometry generation, autonomous form invention, recursive/general nested-loop synthesis, conditions, arbitrary expression synthesis, multidimensional grid-setting progression, automatic definition discovery, visual proof, or aesthetic acceptance.

No claim of production readiness, canon, or visual quality is made.
