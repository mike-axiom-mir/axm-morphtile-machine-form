# MorphTile integration

Tested contract target:

- repository: mike-axiom-mir/axm-morphtile
- commit: 13d83a2b2c0d12644442d3d9e45bcbe0af19876a
- format: v0.4
- provisional envelope: v0.1
- fixture set: v0.2

The adapter emits candidate data only. The receiving caller must validate it against the applicable MorphTile runtime, propose it through clone/plan, inspect conflicts and HOLDs, commit only with the applicable authority, preserve the receipt, and retain rollback.

## Exact pinned-runtime conformance lane

CI checks out the exact `tested_against.commit` above into an isolated `.runtime/morphtile` path and runs the Form Machine candidates through that real core. The integration tests verify:

- all six emitted primitive names survive `createTile` + `validateTile` + `compileMesh`;
- exact triangle/position receipts for the pinned compiler remain stable;
- one composed caller recipe emitted by Form Machine executes through the pinned recipe compiler without a HOLD;
- the CI-declared runtime commit must equal the commit in `machine.json`, so the test cannot silently drift to a newer MorphTile checkout.

The runtime checkout is test infrastructure only. MorphTile core remains an external contract; the Form Machine does not vendor or depend on MorphTile at runtime.

No compatibility is claimed with newer or older MorphTile commits until their conformance tests are run.
