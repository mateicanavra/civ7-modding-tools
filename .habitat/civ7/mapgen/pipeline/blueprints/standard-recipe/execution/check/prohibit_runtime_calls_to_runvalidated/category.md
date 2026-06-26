# Prohibit Runtime Calls To runValidated

Subject ID: `prohibit_runtime_calls_to_runvalidated`

Title: Prohibit Runtime Calls To runValidated

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_calls_to_runvalidated`

Files:
- `prohibit_runtime_calls_to_runvalidated.baseline.json`
- `prohibit_runtime_calls_to_runvalidated.pattern.md`
- `prohibit_runtime_calls_to_runvalidated.rule.json`
- `prohibit_runtime_calls_to_runvalidated.rule.mjs`

Evidence: The pattern forbids runtime layers from calling runValidated.

Notes:
- none
