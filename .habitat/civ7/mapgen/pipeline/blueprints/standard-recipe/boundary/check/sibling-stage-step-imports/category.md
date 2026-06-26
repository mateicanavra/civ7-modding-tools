# Prohibit Sibling Stage Private Step Imports

Subject ID: `sibling-stage-step-imports`

Title: Prohibit Sibling Stage Private Step Imports

Blueprint: `standard-recipe`

Primary category: `boundary`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/sibling-stage-step-imports`

Files:
- `sibling-stage-step-imports.baseline.json`
- `sibling-stage-step-imports.pattern.md`
- `sibling-stage-step-imports.rule.json`
- `sibling-stage-step-imports.rule.mjs`

Evidence: The pattern forbids stage code from importing another stage private steps implementation.

Notes:
- none
