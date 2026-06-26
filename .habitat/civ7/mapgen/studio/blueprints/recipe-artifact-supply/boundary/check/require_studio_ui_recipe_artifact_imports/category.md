# Require Studio UI Recipe Artifact Imports

Subject ID: `require_studio_ui_recipe_artifact_imports`

Title: Require Studio UI Recipe Artifact Imports

Blueprint: `recipe-artifact-supply`

Primary category: `boundary`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/boundary/check/require_studio_ui_recipe_artifact_imports`

Files:
- `require_studio_ui_recipe_artifact_imports.baseline.json`
- `require_studio_ui_recipe_artifact_imports.pattern.md`
- `require_studio_ui_recipe_artifact_imports.rule.json`

Evidence: The pattern requires Studio UI to import recipe artifacts/configs instead of runtime recipe modules.

Notes:
- Name sounds like artifact existence, but the primary purpose is dependency boundary.
