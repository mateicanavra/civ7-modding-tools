# standard-contract-manifest

Blueprint: `standard-recipe`

Primary category: `structure`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/standard-contract-manifest`

Files:
- `standard-contract-manifest.baseline.json`
- `standard-contract-manifest.check.ts`
- `standard-contract-manifest.rule.json`

Evidence: The check compares runtime stage/step order with the Studio recipe-DAG contract manifest.

Notes:
- Primary oracle is topology/order parity; it also protects a derived manifest.
