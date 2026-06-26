# Prohibit Runtime-Local Config Default Merging

Subject ID: `prohibit_runtime_local_config_default_merging`

Title: Prohibit Runtime-Local Config Default Merging

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_local_config_default_merging`

Files:
- `prohibit_runtime_local_config_default_merging.baseline.json`
- `prohibit_runtime_local_config_default_merging.pattern.md`
- `prohibit_runtime_local_config_default_merging.rule.json`

Evidence: The pattern prevents runtime layers from hiding config normalization behind empty-object merge/default syntax.

Notes:
- none
