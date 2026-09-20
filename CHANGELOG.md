# Changelog

## 0.3.0 — 2026-09-20

- Added `intent.parts` for deterministic flat primitive composition using the existing MorphTile recipe substrate.
- Bounded the lane to 1..64 parts and normalized every part through the same primitive vocabulary/parameter rules.
- Added fail-closed HOLDs for unknown per-part fields, unsupported shapes, malformed/oversized compositions, and ambiguous simultaneous `parts` + `recipe` requests.
- Added pinned-runtime proof that normalized parts compile to the same exact receipt as the equivalent caller-supplied recipe.
- Kept surface/look fields outside Form Machine's composition vocabulary.

## 0.2.0 — 2026-09-20

- Added an explicit deterministic primitive vocabulary for box, sphere, cylinder, cone, wedge, and plane.
- Added bounded validation for size, local position/rotation, radial segment counts, cylinder taper, and box subdivision.
- Unknown forms and invalid parameters now HOLD instead of relying on MorphTile's default-box compiler fallback.
- Preserved the existing caller-supplied recipe path unchanged.

## 0.1.0 — 2026-09-19

- Established the isolated repository boundary.
- Added provisional envelope v0.1, machine manifest, fixture, executable proof, tests, and minimal CI.
- Pinned the exact MorphTile v0.4 commit tested as a contract target.
- Recorded unsupported work as HOLD or NOT TESTED.
