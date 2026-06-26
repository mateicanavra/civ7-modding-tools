# Prohibit Runtime Validation And Compiler Imports

Subject ID: `runtime-validation-imports`

Title: Prohibit Runtime Validation And Compiler Imports

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/runtime-validation-imports`

Files:
- `runtime-validation-imports.baseline.json`
- `runtime-validation-imports.pattern.md`
- `runtime-validation-imports.rule.json`
- `runtime-validation-imports.rule.mjs`

Evidence: The pattern prevents runtime layers from importing TypeBox or compiler validation helpers.

Notes:
- none
