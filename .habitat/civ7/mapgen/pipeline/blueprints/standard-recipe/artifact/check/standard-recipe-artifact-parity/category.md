# Verify Standard Recipe Artifacts Match Source Stages

Subject ID: `standard-recipe-artifact-parity`

Title: Verify Standard Recipe Artifacts Match Source Stages

Blueprint: `standard-recipe`

Primary category: `artifact`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/artifact/check/standard-recipe-artifact-parity`

Files:
- `standard-recipe-artifact-parity.baseline.json`
- `standard-recipe-artifact-parity.check.ts`
- `standard-recipe-artifact-parity.rule.json`

Evidence: The check derives recipe schema/default/UI metadata from source stages and rejects drift.

Notes:
- none
