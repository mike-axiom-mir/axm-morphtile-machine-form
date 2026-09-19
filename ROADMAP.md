# Roadmap

1. Land the stacked pinned-runtime conformance lane after exact-head CI: all six primitives plus one composed recipe must compile against the declared MorphTile commit with stable receipts.
2. Separately test current MorphTile main before widening `machine.json.tested_against`; do not infer compatibility from source inspection alone.
3. After the runtime boundary is green, add one small deterministic recipe-composition rule only where a repeated real creation need justifies it.
4. Add negative/budget fixtures discovered by that work and keep unsupported requests explicit.
5. Keep every candidate inspectable and every compatibility claim tied to exact evidence.

Do not add speculative breadth merely to make the repository look complete.
