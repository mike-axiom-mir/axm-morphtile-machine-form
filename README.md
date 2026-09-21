# MorphTile Form Machine

Turns bounded form intent into candidate MorphTile mesh matter. v0.16.0 recognizes MorphTile's explicit primitive vocabulary — box, sphere, cylinder, cone, wedge, and plane — supports fail-closed flat composition, direct + parametric pattern composition, compact bounded repetition, bounded axis-aligned grids with optional per-axis rotation progression, bounded reuse of existing MorphTile definitions, small deterministic repeat progressions for settings, rotation, primitive size, and definition-instance scalar/vector scale, and bounded in-place repetition when one of those progression rules actually changes authored target state. The caller-supplied recipe path remains available as an expert escape hatch.

## Boundary answers

1. **What it does:** Maps a small deterministic form vocabulary, bounded local geometry parameters, bounded direct/pattern compositions, bounded repeated/grid primitive or definition patterns, bounded definition-instance requests, and evidence-backed repeat/grid progression rules into candidate MorphTile mesh facets.
2. **What it does not own:** Canonical worlds, merge authority, definition discovery/closure, surface quality, behavior, UI, or aesthetic acceptance.
3. **What it accepts:** axm.morphtile.form-request/v0.1 in the provisional v0.1 envelope.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate; never an automatic world mutation.
5. **MorphTile interaction:** output goes through MorphTile's public contracts. MorphTile does not depend on this repository.
6. **Evidence:** Local deterministic mapping/boundary tests plus pinned-runtime conformance when exact-head CI is green. Visual quality is explicitly not verified.
7. **When it cannot satisfy a request:** Unsupported named forms return HOLD_FORM_VOCABULARY_MISSING; malformed/out-of-bound primitive parameters return HOLD_FORM_PARAMETER_INVALID; malformed/oversized compositions, repeats, grids, definition instances, and progression rules HOLD instead of being guessed.

## Primitive vocabulary

Explicitly recognized names:

- box
- sphere
- cylinder
- cone
- wedge
- plane

All primitives accept a positive finite 3-vector `size`. Optional `pos` and `rot` are finite 3-vectors. `segments` is bounded to 3..128 for sphere/cylinder/cone; `taper` is a positive finite cylinder parameter; `sub` is a bounded box subdivision parameter.

Unknown names are never allowed to fall through MorphTile's default-box compiler behavior: the machine returns HOLD instead of fabricating a different shape.

## Bounded flat composition

`intent.parts` accepts 1..64 primitive parts using the same geometry vocabulary and parameter rules. Each part is normalized before a MorphTile recipe is emitted.

This lane deliberately rejects unknown per-part fields, unsupported shapes, malformed parameters, more than 64 parts, and ambiguous requests that provide more than one composition mode.

## Bounded direct + pattern composition

`intent.compose` accepts 1..64 ordered blocks. Each block must contain exactly one already-bounded target:

- `{ "part": { ...primitive form... } }`
- `{ "instance": { "use": "definition-id", ... } }`
- `{ "repeat": { ...bounded repeat... } }`
- `{ "grid": { ...bounded grid... } }`

Direct targets reuse the primitive/definition normalizers. Pattern blocks reuse the same repeat/grid normalizers used by the standalone modes; Form Machine does not expose a second looser pattern language. Blocks stay compact MorphTile recipe matter rather than materializing copied geometry.

The whole compose request is capped at 64 requested placements across direct, repeat, and grid blocks. This is a creation-side safety budget: referenced definition bodies may themselves contain more recipe matter at runtime. Recursive compose blocks, arbitrary loop bodies, custom loop variables, conditions, and general expression authoring remain HELD.

If any direct or patterned target references a definition, the candidate carries `DEFINITION_RUNTIME_RESOLUTION_REQUIRED`; Form Machine still does not fetch or package the definition body.

## Bounded repeat composition

`intent.repeat` creates a compact parametric MorphTile recipe from exactly one normalized target: either a primitive `part` or a definition `instance`.

Required fields:

- `count`: integer 1..64;
- `step`: finite 3-vector translation applied per instance;
- exactly one of `part` or `instance`.

Primitive targets use the normal Form Machine primitive vocabulary. Definition targets use the bounded definition-instance vocabulary below. The repeat compiler emits MorphTile recipe expressions using the deterministic recipe loop index rather than materializing copied geometry. Unknown repeat or target fields fail closed.

A repeat with no progression must move on at least one translation axis, preserving the original anti-duplicate rule. From v0.15.0, `step: [0,0,0]` is accepted only when a separately validated bounded progression (`with_step`, `rot_step`, `size_step`, or `scale_step`) changes authored target state and the progression can actually take effect. The exact authored base position is restored before candidate matter is emitted; Form does not claim that a changed rotation or setting is visually distinct for every symmetric primitive or every external definition.

For either primitive or definition-instance targets, repeat may optionally include `rot_step`, a finite 3-vector angular delta. At least one axis must be non-zero and `count` must be at least 2. Form compiles the normalized target rotation as `base + i * delta` on each active axis using the fixed repeat index `i`, after proving every generated value remains finite across the complete bounded repeat domain.

For primitive targets only, repeat may optionally include `size_step`, a finite 3-vector dimension delta. At least one axis must change and `count` must be at least 2. Every generated size component is checked over the complete repeat domain and must remain finite and strictly positive before Form emits the recipe. Definition instances use whole-form scale rather than primitive size.

For definition-instance targets only, repeat may include `with_step`, an object of 1..32 finite numeric deltas. Every stepped setting must already exist as a finite numeric base in `instance.with`, at least one delta must be non-zero, and `count` must be at least 2 so the authored setting delta can affect a placement. The machine compiles each stepped setting as `base + i * delta` using the fixed repeat index.

Definition-instance repeats may also include `scale_step` in one of two bounded forms. A scalar step is one finite non-zero number and requires scalar `instance.scale` or omitted unit scale. A vector step is exactly three finite numbers with at least one non-zero axis and requires vector `instance.scale`, or omitted scale which maps to MorphTile's exact implicit unit vector `[1,1,1]`. Form proves every generated scale/component remains finite and strictly positive across the complete repeat domain before emission. Scalar/vector base-step coercion is deliberately not guessed: mismatched forms HOLD.

`rot_step`, `with_step`, and scalar/vector `scale_step` may coexist on a definition-instance repeat because they affect separate normalized fields while sharing the same already-bounded repeat index. Primitive `size_step` may coexist with `rot_step` for the same reason. The same bounded repeat, including the v0.15 in-place progression rule, may be used as one `intent.compose` block. It does not become recursively nestable.

## Bounded grid composition

`intent.grid` creates a compact axis-aligned 1D/2D/3D grid from exactly one normalized primitive `part` or definition `instance`.

Required fields:

- `counts`: three integers describing X/Y/Z cell counts;
- `step`: finite X/Y/Z spacing;
- exactly one of `part` or `instance`.

The total cell count must be 2..64. An active axis normally requires a non-zero translation step. From v0.16.0 an active axis may instead use `rot_step` for bounded rotation progression while remaining at one translation coordinate. `rot_step` is an object keyed only by `x`, `y`, or `z`; each provided axis value must be exactly three finite rotation deltas and must change at least one rotation component. A provided rotation axis must have a cell count of at least 2. An active grid axis that has neither translation nor its own rotation progression still HOLDS.

Grid rotation is compiled with the existing fixed loop variables `gx`, `gy`, and `gz`: each target rotation component becomes its exact base plus the sum of the authored per-axis loop-index deltas. Single-cell axes remain omitted from the loop tree. Form proves the complete bounded generated position+rotation state domain before emission; non-finite expansion or two grid cells collapsing to the same authored position+rotation state HOLDS. This is authored-state distinctness, not a visual uniqueness claim for symmetric geometry.

The same bounded grid rule is reused inside `intent.compose`; it is intentionally not a second looser grid language. MorphTile already owns nested loop variables and expression evaluation, so this producer rule reuses the runtime substrate rather than materializing copied parts or exposing caller-authored expressions.

Per-axis definition-setting, primitive-size, or definition-scale grid progression is still not exposed. Those remain separate multidimensional semantics that require their own grounded rules rather than being silently inferred from repeat progression.

## Bounded definition reuse

`intent.instances` accepts 1..64 references to definitions that already exist in the MorphTile world used at runtime. The same bounded definition target may also be used inside `intent.repeat`, `intent.grid`, or `intent.compose`.

Each instance requires `use` and may add:

- `with`: up to 32 finite numeric settings for a parametric recipe definition;
- `pos`: finite 3-vector translation;
- `rot`: finite 3-vector rotation;
- `scale`: a positive finite scalar or positive finite 3-vector.

Form Machine validates and normalizes the request, then emits MorphTile recipe `use` parts. It deliberately does **not** fetch definitions, duplicate their bodies, or claim dependency closure. Missing definitions and unsupported settings remain visible MorphTile runtime HOLDs. Assembly Machine remains the owner of definition/word closure and provenance when packaging complete kits.

Repeat progression may change existing normalized definition settings, rotation or scalar/vector scale over the fixed repeat index. Grid progression may currently change only definition rotation over fixed `gx`/`gy`/`gz` indices; grid settings and scale remain fixed.

These capabilities belong in Form Machine rather than MorphTile core because MorphTile v0.4 already provides the universal recipe representation, definition `use`, expression-valued transforms/settings/scale, nested loop composition and runtime resolution semantics.

Surface/color fields are not accepted by bounded Form Machine composition lanes because Surface Machine owns look-development concerns.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: deterministic primitive normalization, bounded flat primitive composition, bounded direct + pattern composition, bounded repeat composition, bounded axis-aligned grid composition with bounded per-axis rotation progression, bounded definition-instance composition, bounded repeat setting/rotation/primitive-size/definition-scalar-or-vector-scale progression, bounded in-place repeat progression when another validated progression changes authored target state, the existing caller-recipe adapter, and the local envelope used by fixtures.
- TESTED: the claims named by the local test files once CI for the exact branch head is green.
- RUNTIME TARGET: MorphTile commit `2bdf8eade1376055473b9cc1b11734b72a5566e5`.
- RUNTIME BOUNDARY: caller-owned recipes remain an expert escape hatch; current pinned MorphTile runtime validation owns generic recipe-expression meaning, including `HOLD_RECIPE_NONFINITE_VALUE` when a present numeric expression evaluates non-finite. Finite authored Form primitive values can also become non-finite during derived mesh arithmetic; current pinned MorphTile owns that shared compiled-representation boundary and returns `HOLD_MESH_NONFINITE_VALUE` while clearing partial `P/T/K`.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: visual quality; arbitrary geometry generation; future MorphTile commits beyond the exact pin.
- HELD: autonomous geometry synthesis, recursive/general nested loop/condition/expression recipe synthesis beyond the fixed rules, caller-authored expressions in bounded settings/transforms, scalar/vector scale coercion, multidimensional grid-setting/size/scale progression, automatic definition discovery, visual proof, and production readiness.

This is a bounded creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
