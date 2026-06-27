# Prohibit Recipe DAG Runtime Source Dependencies

Subject ID: `prohibit_recipe_dag_runtime_source_dependencies`

Title: Prohibit Recipe DAG Runtime Source Dependencies

Blueprint: `recipe-dag-service`

Primary category: `boundary`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/recipe-dag-service/boundary/check/prohibit_recipe_dag_runtime_source_dependencies`

Files:
- `prohibit_recipe_dag_runtime_source_dependencies.baseline.json`
- `prohibit_recipe_dag_runtime_source_dependencies.pattern.md`
- `prohibit_recipe_dag_runtime_source_dependencies.rule.json`

Evidence: The pattern owns direct source/import prohibitions split out of `require_recipe_dag_contract_metadata`.

Notes:
- Transitive import-graph closure and required graph membership remain in `require_recipe_dag_contract_metadata`.
