# Verify Standard Recipe Artifacts Match Source Stages

Subject ID: `verify_standard_recipe_artifacts_match_source_stages`

Title: Verify Standard Recipe Artifacts Match Source Stages

Blueprint: `standard-recipe`

Primary category: `artifact`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/artifact/check/verify_standard_recipe_artifacts_match_source_stages`

Files:
- `verify_standard_recipe_artifacts_match_source_stages.baseline.json`
- `verify_standard_recipe_artifacts_match_source_stages.check.ts`
- `verify_standard_recipe_artifacts_match_source_stages.rule.json`

Evidence: The check derives recipe schema/default/UI metadata from source stages and rejects drift.

Notes:
- Residual owner class: Nx/package artifact validator; generated artifact currentness belongs to target ordering and package verification.
- none
