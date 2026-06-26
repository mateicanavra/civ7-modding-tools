# Prohibit Runtime-Local Config Default Merging

Subject ID: `runtime-config-merge`

Title: Prohibit Runtime-Local Config Default Merging

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/runtime-config-merge`

Files:
- `runtime-config-merge.baseline.json`
- `runtime-config-merge.pattern.md`
- `runtime-config-merge.rule.json`
- `runtime-config-merge.rule.mjs`

Evidence: The pattern prevents runtime layers from hiding config normalization behind empty-object merge/default syntax.

Notes:
- none
