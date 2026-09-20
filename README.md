# MorphTile Form Machine

Turns bounded form intent into candidate MorphTile mesh matter. v0.11.0 recognizes MorphTile's explicit primitive vocabulary — box, sphere, cylinder, cone, wedge, and plane — supports fail-closed flat composition, direct + parametric pattern composition, compact bounded repetition, bounded axis-aligned grids, bounded reuse of existing MorphTile definitions, bounded per-repeat progression of existing numeric definition settings, and bounded per-repeat target rotation progression. The caller-supplied recipe path remains available as an expert escape hatch.

## Boundary answers

1. **What it does:** Maps a small deterministic form vocabulary, bounded local geometry parameters, bounded direct/pattern compositions, bounded repeated/grid primitive or definition patterns, bounded definition-instance requests, one bounded definition-setting progression rule, and one bounded repeat-rotation progression rule into candidate MorphTile mesh facets.
2. **What it does not own:** Canonical worlds, merge authority, definition discovery/closure, surface quality, behavior, UI, or aesthetic acceptance.
3. **What it accepts:** axm.morphtile.form-request/v0.1 in the provisional v0.1 envelope.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate; never an automatic world mutation.
5. **MorphTile interaction:** output goes through MorphTile's public contracts. MorphTile does not depend on this repository.
6. **Evidence:** Local deterministic mapping/boundary tests plus pinned-runtime conformance when exact-head CI is green. Visual quality is explicitly not verified.
7. **When it cannot satisfy a request:** Unsupported named forms return HOLD_FORM_VOCABULARY_MISSING; malformed/out-of-bound primitive parameters return HOLD_FORM_PARAMETER_INVALID; malformed/oversized compositions, repeats, grids, definition instances, setting progressions, and rotation progressions HOLD instead of being guessed.

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

Primitive targets use the normal Form Machine primitive vocabulary. Definition targets use the bounded definition-instance vocabulary below. The repeat compiler emits MorphTile recipe expressions using the deterministic recipe loop index rather than materializing dozens of copied parts in the request/output. A zero translation step is rejected because it would duplicate identical geometry at the same location. Unknown repeat or target fields fail closed.

For either primitive or definition-instance targets, repeat may optionally include `rot_step`, a finite 3-vector angular delta. At least one axis must be non-zero and `count` must be at least 2. Form compiles the normalized target rotation as `base + i * delta` on each active axis using the fixed repeat index `i`, after proving every generated value remains finite across the complete bounded repeat domain. This captures common stair/spiral/fan-like turning sequences without exposing caller-authored expression trees. A malformed vector, all-zero delta, single-placement request, or finite-authored progression that would overflow HOLDs.

For a definition-instance target only, repeat may also contain `with_step`, an object of 1..32 finite numeric deltas. Every stepped setting must already exist as a finite numeric base in `instance.with`, and at least one delta must be non-zero. The machine compiles each stepped setting as `base + i * delta` using its fixed repeat index `i`. This permits bounded sequences such as progressively wider panels or longer beams without exposing caller-authored expression trees. `with_step` on a primitive, a missing base setting, malformed deltas, or a no-op all HOLD.

`rot_step` and `with_step` may coexist on a definition-instance repeat because they affect separate normalized fields while sharing the same already-bounded repeat index. The same bounded repeat may be used as one `intent.compose` block. It does not become recursively nestable.

## Bounded grid composition

`intent.grid` creates a compact axis-aligned 1D/2D/3D grid from exactly one normalized primitive `part` or definition `instance`.

Required fields:

- `counts`: three integers describing X/Y/Z cell counts;
- `step`: finite X/Y/Z spacing;
- exactly one of `part` or `instance`.

The total cell count must be 2..64. Any axis with more than one cell requires a non-zero step on that axis, so the machine cannot silently stack duplicates at one position. Single-cell axes are omitted from the emitted loop tree. Multi-axis grids compile into MorphTile's existing nested recipe loops with fixed loop variables `gx`, `gy`, and `gz`; the request does not contain hand-authored loop expressions.

The same bounded grid may be used as one `intent.compose` block. This is intentionally a fixed grid rule, not general nested-loop synthesis. Per-axis definition-setting or rotation progression is not exposed yet; either would require a separately grounded multidimensional rule rather than silently generalizing repeat semantics.

## Bounded definition reuse

`intent.instances` accepts 1..64 references to definitions that already exist in the MorphTile world used at runtime. The same bounded definition target may also be used inside `intent.repeat`, `intent.grid`, or `intent.compose`.

Each instance requires `use` and may add:

- `with`: up to 32 finite numeric settings for a parametric recipe definition;
- `pos`: finite 3-vector translation;
- `rot`: finite 3-vector rotation;
- `scale`: a positive finite scalar or positive finite 3-vector.

Form Machine validates and normalizes the request, then emits MorphTile recipe `use` parts. It deliberately does **not** fetch definitions, duplicate their bodies, or claim dependency closure. Missing definitions and unsupported settings remain visible MorphTile runtime HOLDs. Assembly Machine remains the owner of definition/word closure and provenance when packaging complete kits.

The optional repeat-only `with_step` rule changes existing numeric `with` settings over the repeat index. The optional repeat-only `rot_step` rule changes normalized target rotation over that same fixed index for either primitive or definition targets. Direct instances and grid instances remain fixed-setting/fixed-rotation references.

These capabilities belong in Form Machine rather than MorphTile core because MorphTile v0.4 already provides the universal recipe representation, definition `use`, expression-valued transforms/settings, nested loop composition and runtime resolution semantics.

Surface/color fields are not accepted by bounded Form Machine composition lanes because Surface Machine owns look-development concerns.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: deterministic primitive normalization, bounded flat primitive composition, bounded direct + pattern composition, bounded repeat composition, bounded axis-aligned grid composition, bounded definition-instance composition, bounded repeat definition-setting progression, bounded repeat target-rotation progression, the existing caller-recipe adapter, and the local envelope used by fixtures.
- TESTED: the claims named by the local test files once CI for the exact branch head is green.
- RUNTIME TARGET: MorphTile commit `429a344f7d9333bef01cf9de1c292c3af09abec2`.
- RUNTIME BOUNDARY: caller-owned recipes remain an expert escape hatch; current pinned MorphTile runtime validation owns generic recipe-expression meaning, including `HOLD_RECIPE_NONFINITE_VALUE` when a present numeric expression evaluates non-finite. Finite authored Form primitive values can also become non-finite during derived mesh arithmetic; current pinned MorphTile owns that shared compiled-representation boundary and returns `HOLD_MESH_NONFINITE_VALUE` while clearing partial `P/T/K`.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: visual quality; arbitrary geometry generation; future MorphTile commits beyond the exact pin.
- HELD: autonomous geometry synthesis, recursive/general nested loop/condition/expression recipe synthesis beyond the fixed rules, caller-authored expressions in bounded settings/transforms, multidimensional grid-setting/rotation progression, automatic definition discovery, visual proof, and production readiness.

This is a bounded creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
