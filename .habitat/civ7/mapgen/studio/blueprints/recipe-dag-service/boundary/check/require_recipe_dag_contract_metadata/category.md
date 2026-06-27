# Require Recipe DAG Contract Metadata

Subject ID: `require_recipe_dag_contract_metadata`

Title: Require Recipe DAG Contract Metadata

Blueprint: `recipe-dag-service`

Primary category: `boundary`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/recipe-dag-service/boundary/check/require_recipe_dag_contract_metadata`

Files:
- `require_recipe_dag_contract_metadata.baseline.json`
- `require_recipe_dag_contract_metadata.check.ts`
- `require_recipe_dag_contract_metadata.rule.json`

Evidence: The check keeps the recipe-DAG service import graph on contract-only surfaces and away from runtime recipe/generated output roots.

Notes:
- Direct source/import prohibitions moved to `prohibit_recipe_dag_runtime_source_dependencies`.
