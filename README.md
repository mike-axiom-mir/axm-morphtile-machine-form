# MorphTile Form Machine

Turns bounded form intent into candidate MorphTile mesh matter. v0.2.0 recognizes MorphTile's explicit primitive vocabulary — box, sphere, cylinder, cone, wedge, and plane — plus the existing caller-supplied recipe path.

## Boundary answers

1. **What it does:** Maps a small deterministic form vocabulary and bounded local geometry parameters into candidate MorphTile mesh facets.
2. **What it does not own:** Canonical worlds, merge authority, surface quality, behavior, UI, or aesthetic acceptance.
3. **What it accepts:** axm.morphtile.form-request/v0.1 in the provisional v0.1 envelope.
4. **What it produces:** A morphtile.tile-spec/v0.4 candidate; never an automatic world mutation.
5. **MorphTile interaction:** output goes through MorphTile's public contracts and clone → plan → commit → receipt → rollback path. MorphTile does not depend on this repository.
6. **Evidence:** Local structural mapping and parameter-boundary tests. Visual quality is explicitly not verified.
7. **When it cannot satisfy a request:** Unsupported named forms return HOLD_FORM_VOCABULARY_MISSING; malformed or out-of-bound primitive parameters return HOLD_FORM_PARAMETER_INVALID.

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

## Run

    npm test

Node 18 or later; zero runtime dependencies; no secrets or network required.

## Truth boundary

- IMPLEMENTED: deterministic primitive normalization, the existing caller-recipe adapter, and the local envelope used by fixtures.
- TESTED: the claims named by the local test files once CI for the exact branch head is green.
- SOURCE-INSPECTED: current MorphTile main exposes the same six primitive names in its mesh compiler; that source inspection is not runtime compatibility evidence.
- EXPERIMENTAL: envelope v0.1 and every candidate schema in this foundation.
- NOT TESTED: runtime compatibility beyond MorphTile commit 13d83a2b2c0d12644442d3d9e45bcbe0af19876a; visual quality; arbitrary geometry generation.
- HELD: No autonomous geometry synthesis, cross-repo runtime execution, or visual proof.

This is a foundation, not evidence that MorphTile can autonomously manufacture MorphTile.
