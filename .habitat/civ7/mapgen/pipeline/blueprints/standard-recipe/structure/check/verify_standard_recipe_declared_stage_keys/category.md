# Verify Standard Recipe Declared Stage Keys

Subject ID: `verify_standard_recipe_declared_stage_keys`

Title: Verify Standard Recipe Declared Stage Keys

Blueprint: `standard-recipe`

Primary category: `structure`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/verify_standard_recipe_declared_stage_keys`

Files:
- `verify_standard_recipe_declared_stage_keys.baseline.json`
- `verify_standard_recipe_declared_stage_keys.check.mjs`
- `verify_standard_recipe_declared_stage_keys.rule.json`

Evidence: The check asserts the literal `orderStandardStages({ ... })` key order in the standard recipe source.

Notes:
- Residual owner class: package-local contract validator; declared stage keys are manifest/recipe semantics, not file-tree topology.
- Split from `preserve_standard_stage_topology_and_path_invariants` when pure file-tree topology moved to `structure-check`.
- This remains command-owned because it parses source declaration order; it is not file-tree topology.
