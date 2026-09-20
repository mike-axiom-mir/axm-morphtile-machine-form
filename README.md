# MorphTile Form Machine

Turns bounded form intent into candidate MorphTile mesh matter. v0.4.0 recognizes MorphTile's explicit primitive vocabulary — box, sphere, cylinder, cone, wedge, and plane — supports fail-closed flat primitive composition, and adds a compact bounded repeat vocabulary that compiles repeated geometry into MorphTile recipe matter. The existing caller-supplied recipe path remains available as an expert escape hatch.

## Boundary answers

1. **What it does:** Maps a small deterministic form vocabulary, bounded local geometry parameters, bounded flat primitive compositions, and bounded repeated primitive patterns into candidate MorphTile mesh facets.
2. **What it does not own:** Canonical worlds, merge authority, surface quality, behavior, UI, or aesthetic acceptance.
3. **What it accepts:** axm.morphtile.form-request/v0.1 in the provisional v0.1 envelope.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate; never an automatic world mutation.
5. **MorphTile interaction:** output goes through MorphTile's public contracts. MorphTile does not depend on this repository.
6. **Evidence:** Local deterministic mapping/boundary tests plus pinned-runtime conformance when exact-head CI is green. Visual quality is explicitly not verified.
7. **When it cannot satisfy a request:** Unsupported named forms return HOLD_FORM_VOCABULARY_MISSING; malformed/out-of-bound primitive parameters return HOLD_FORM_PARAMETER_INVALID; malformed/oversized compositions and repeats HOLD instead of being guessed.

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

`intent.repeat` creates a compact parametric MorphTile recipe from one normalized primitive part.

Required fields:

- `count`: integer 1..64;
- `step`: finite 3-vector translation applied per instance;
- `part`: one primitive using the same Form Machine vocabulary.

The repeat compiler emits MorphTile recipe expressions using the deterministic recipe loop index rather than materializing dozens of copied parts in the request/output. A zero translation step is rejected because it would duplicate identical geometry at the same location. Unknown repeat or part fields fail closed.

This is intentionally smaller than MorphTile's full recipe language. Conditions, arbitrary expressions, definition reuse, nested loops, and autonomous pattern invention remain outside this bounded machine vocabulary.

Surface/color fields are not accepted by the bounded Form Machine composition lanes because Surface Machine owns look-development concerns.

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: deterministic primitive normalization, bounded flat primitive composition, bounded primitive repeat composition, the existing caller-recipe adapter, and the local envelope used by fixtures.
- TESTED: the claims named by the local test files once CI for the exact branch head is green.
- RUNTIME TARGET: MorphTile commit 4346df01ed18cd1336064f9323d7766ff4f6338a, the current main observed for this candidate.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: visual quality; arbitrary geometry generation; future MorphTile commits beyond the exact pin.
- HELD: autonomous geometry synthesis, general loop/condition/expression recipe synthesis, definition reuse, visual proof, and production readiness.

This is a bounded creation machine, not evidence that MorphTile can autonomously manufacture MorphTile.
