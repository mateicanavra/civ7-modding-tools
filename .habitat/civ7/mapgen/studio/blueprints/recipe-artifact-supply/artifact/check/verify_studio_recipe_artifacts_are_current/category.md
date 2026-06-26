# Verify Studio Recipe Artifacts Are Current

Subject ID: `verify_studio_recipe_artifacts_are_current`

Title: Verify Studio Recipe Artifacts Are Current

Blueprint: `recipe-artifact-supply`

Primary category: `artifact`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current`

Files:
- `verify_studio_recipe_artifacts_are_current.baseline.json`
- `verify_studio_recipe_artifacts_are_current.check.mjs`
- `verify_studio_recipe_artifacts_are_current.rule.json`

Evidence: The check requires recipe dist artifacts to exist and be newer than source inputs.

Notes:
- none
