# Verify Runtime Stage Order Matches Contract Manifest

Subject ID: `verify_runtime_stage_order_matches_contract_manifest`

Title: Verify Runtime Stage Order Matches Contract Manifest

Blueprint: `standard-recipe`

Primary category: `structure`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/verify_runtime_stage_order_matches_contract_manifest`

Files:
- `verify_runtime_stage_order_matches_contract_manifest.baseline.json`
- `verify_runtime_stage_order_matches_contract_manifest.check.ts`
- `verify_runtime_stage_order_matches_contract_manifest.rule.json`

Evidence: The check compares runtime stage/step order with the Studio recipe-DAG contract manifest.

Notes:
- Primary oracle is topology/order parity; it also protects a derived manifest.
