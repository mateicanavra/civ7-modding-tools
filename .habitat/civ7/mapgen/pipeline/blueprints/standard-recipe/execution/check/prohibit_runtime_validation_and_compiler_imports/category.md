# Prohibit Runtime Validation And Compiler Imports

Subject ID: `prohibit_runtime_validation_and_compiler_imports`

Title: Prohibit Runtime Validation And Compiler Imports

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_validation_and_compiler_imports`

Files:
- `prohibit_runtime_validation_and_compiler_imports.baseline.json`
- `prohibit_runtime_validation_and_compiler_imports.pattern.md`
- `prohibit_runtime_validation_and_compiler_imports.rule.json`

Evidence: The pattern prevents runtime layers from importing TypeBox or compiler validation helpers.

Notes:
- none
