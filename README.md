# MorphTile Form Machine

Turns bounded form intent into candidate MorphTile mesh matter. v0.5.0 recognizes MorphTile's explicit primitive vocabulary — box, sphere, cylinder, cone, wedge, and plane — supports fail-closed flat primitive composition, compact bounded repetition, and bounded reuse of existing MorphTile definitions. The existing caller-supplied recipe path remains available as an expert escape hatch.

## Boundary answers

1. **What it does:** Maps a small deterministic form vocabulary, bounded local geometry parameters, bounded flat primitive compositions, bounded repeated primitive/definition patterns, and bounded definition-instance requests into candidate MorphTile mesh facets.
2. **What it does not own:** Canonical worlds, merge authority, definition discovery/closure, surface quality, behavior, UI, or aesthetic acceptance.
3. **What it accepts:** axm.morphtile.form-request/v0.1 in the provisional v0.1 envelope.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate; never an automatic world mutation.
5. **MorphTile interaction:** output goes through MorphTile's public contracts. MorphTile does not depend on this repository.
6. **Evidence:** Local deterministic mapping/boundary tests plus pinned-runtime conformance when exact-head CI is green. Visual quality is explicitly not verified.
7. **When it cannot satisfy a request:** Unsupported named forms return HOLD_FORM_VOCABULARY_MISSING; malformed/out-of-bound primitive parameters return HOLD_FORM_PARAMETER_INVALID; malformed/oversized compositions, repeats, and definition instances HOLD instead of being guessed.

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

## Bounded repeat composition

`intent.repeat` creates a compact parametric MorphTile recipe from exactly one normalized target: either a primitive `part` or a definition `instance`.

Required fields:

- `count`: integer 1..64;
- `step`: finite 3-vector translation applied per instance;
- exactly one of `part` or `instance`.

Primitive targets use the normal Form Machine primitive vocabulary. Definition targets use the bounded definition-instance vocabulary below. The repeat compiler emits MorphTile recipe expressions using the deterministic recipe loop index rather than materializing dozens of copied parts in the request/output. A zero translation step is rejected because it would duplicate identical geometry at the same location. Unknown repeat or target fields fail closed.

## Bounded definition reuse

`intent.instances` accepts 1..64 references to definitions that already exist in the MorphTile world used at runtime. The same bounded definition target may also be used inside `intent.repeat` for compact repeated placement.

Each instance requires `use` and may add:

- `with`: up to 32 finite numeric settings for a parametric recipe definition;
- `pos`: finite 3-vector translation;
- `rot`: finite 3-vector rotation;
- `scale`: a positive finite scalar or positive finite 3-vector.

Form Machine validates and normalizes the request, then emits MorphTile recipe `use` parts. It deliberately does **not** fetch definitions, duplicate their bodies, or claim dependency closure. Missing definitions and unsupported settings remain visible MorphTile runtime HOLDs. Assembly Machine remains the owner of definition/word closure and provenance when packaging complete kits.

This belongs in Form Machine rather than MorphTile core because MorphTile v0.4 already provides the universal recipe `use` representation, loop composition, and runtime resolution semantics.

Surface/color fields are not accepted by bounded Form Machine composition lanes because Surface Machine owns look-development concerns.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: deterministic primitive normalization, bounded flat primitive composition, bounded repeat composition for primitives and definition instances, bounded definition-instance composition, the existing caller-recipe adapter, and the local envelope used by fixtures.
- TESTED: the claims named by the local test files once CI for the exact branch head is green.
- RUNTIME TARGET: MorphTile commit `a579182ae585e5722ac87dd0cc8209963b18d000`.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: visual quality; arbitrary geometry generation; future MorphTile commits beyond the exact pin.
- HELD: autonomous geometry synthesis, general nested loop/condition/expression recipe synthesis, automatic definition discovery, visual proof, and production readiness.

This is a bounded creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
