# MorphTile Form Machine

Turns bounded form intent into candidate MorphTile mesh matter. v0.7.0 recognizes MorphTile's explicit primitive vocabulary — box, sphere, cylinder, cone, wedge, and plane — supports fail-closed flat primitive composition, mixed primitive/definition composition, compact bounded repetition, bounded axis-aligned grid composition, and bounded reuse of existing MorphTile definitions. The existing caller-supplied recipe path remains available as an expert escape hatch.

## Boundary answers

1. **What it does:** Maps a small deterministic form vocabulary, bounded local geometry parameters, bounded flat and mixed compositions, bounded repeated/grid primitive or definition patterns, and bounded definition-instance requests into candidate MorphTile mesh facets.
2. **What it does not own:** Canonical worlds, merge authority, definition discovery/closure, surface quality, behavior, UI, or aesthetic acceptance.
3. **What it accepts:** axm.morphtile.form-request/v0.1 in the provisional v0.1 envelope.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate; never an automatic world mutation.
5. **MorphTile interaction:** output goes through MorphTile's public contracts. MorphTile does not depend on this repository.
6. **Evidence:** Local deterministic mapping/boundary tests plus pinned-runtime conformance when exact-head CI is green. Visual quality is explicitly not verified.
7. **When it cannot satisfy a request:** Unsupported named forms return HOLD_FORM_VOCABULARY_MISSING; malformed/out-of-bound primitive parameters return HOLD_FORM_PARAMETER_INVALID; malformed/oversized compositions, repeats, grids, mixed compositions, and definition instances HOLD instead of being guessed.

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

## Bounded mixed composition

`intent.compose` accepts 1..64 ordered items and lets one recipe combine the two already-supported reusable target kinds:

- `{ "part": { ...primitive form... } }`
- `{ "instance": { "use": "definition-id", ... } }`

Each item must provide exactly one target. Primitive items use the existing bounded primitive normalizer; definition items use the existing bounded definition-instance normalizer. Order is preserved in the emitted MorphTile recipe. If a definition reference is present, the candidate carries `DEFINITION_RUNTIME_RESOLUTION_REQUIRED` because Form Machine does not fetch or package definition bodies.

The purpose is not generic recipe authoring. It closes the ordinary creation gap where a form needs both newly described primitive geometry and already-owned reusable definition Lego in one bounded recipe. Unknown fields, malformed targets, more than 64 items, and ambiguous top-level composition modes fail closed.

## Bounded repeat composition

`intent.repeat` creates a compact parametric MorphTile recipe from exactly one normalized target: either a primitive `part` or a definition `instance`.

Required fields:

- `count`: integer 1..64;
- `step`: finite 3-vector translation applied per instance;
- exactly one of `part` or `instance`.

Primitive targets use the normal Form Machine primitive vocabulary. Definition targets use the bounded definition-instance vocabulary below. The repeat compiler emits MorphTile recipe expressions using the deterministic recipe loop index rather than materializing dozens of copied parts in the request/output. A zero translation step is rejected because it would duplicate identical geometry at the same location. Unknown repeat or target fields fail closed.

## Bounded grid composition

`intent.grid` creates a compact axis-aligned 1D/2D/3D grid from exactly one normalized primitive `part` or definition `instance`.

Required fields:

- `counts`: three integers describing X/Y/Z cell counts;
- `step`: finite X/Y/Z spacing;
- exactly one of `part` or `instance`.

The total cell count must be 2..64. Any axis with more than one cell requires a non-zero step on that axis, so the machine cannot silently stack duplicates at one position. Single-cell axes are omitted from the emitted loop tree. Multi-axis grids compile into MorphTile's existing nested recipe loops with fixed loop variables `gx`, `gy`, and `gz`; the request does not contain hand-authored loop expressions.

This is intentionally a bounded grid rule, not general nested-loop synthesis. It converts a common repeated geometry pattern into deterministic machinery while keeping arbitrary loop/condition/expression authoring HELD.

## Bounded definition reuse

`intent.instances` accepts 1..64 references to definitions that already exist in the MorphTile world used at runtime. The same bounded definition target may also be used inside `intent.repeat`, `intent.grid`, or `intent.compose`.

Each instance requires `use` and may add:

- `with`: up to 32 finite numeric settings for a parametric recipe definition;
- `pos`: finite 3-vector translation;
- `rot`: finite 3-vector rotation;
- `scale`: a positive finite scalar or positive finite 3-vector.

Form Machine validates and normalizes the request, then emits MorphTile recipe `use` parts. It deliberately does **not** fetch definitions, duplicate their bodies, or claim dependency closure. Missing definitions and unsupported settings remain visible MorphTile runtime HOLDs. Assembly Machine remains the owner of definition/word closure and provenance when packaging complete kits.

These capabilities belong in Form Machine rather than MorphTile core because MorphTile v0.4 already provides the universal recipe representation, definition `use`, nested loop composition, transforms and runtime resolution semantics.

Surface/color fields are not accepted by bounded Form Machine composition lanes because Surface Machine owns look-development concerns.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: deterministic primitive normalization, bounded flat primitive composition, bounded mixed primitive/definition composition, bounded repeat composition, bounded axis-aligned grid composition, bounded definition-instance composition, the existing caller-recipe adapter, and the local envelope used by fixtures.
- TESTED: the claims named by the local test files once CI for the exact branch head is green.
- RUNTIME TARGET: MorphTile commit `ef2b3c6986aa1a333247feffc43a8443f17239d0`.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: visual quality; arbitrary geometry generation; future MorphTile commits beyond the exact pin.
- HELD: autonomous geometry synthesis, general nested loop/condition/expression recipe synthesis beyond the fixed grid rule, automatic definition discovery, visual proof, and production readiness.

This is a bounded creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
