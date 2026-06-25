# standard-contract-manifest

Primary category: `structure`

Secondary categories: `derived-artifacts`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `standard-contract-manifest.baseline.json`
- `standard-contract-manifest.check.ts`
- `standard-contract-manifest.rule.json`

Evidence: The check compares runtime stage/step order with the Studio recipe-DAG contract manifest.

Notes:
- Primary oracle is topology/order parity; it also protects a derived manifest.
