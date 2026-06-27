# Verify Standard Recipe Public Authoring Surface

Subject ID: `verify_standard_recipe_public_authoring_surface`

Title: Verify Standard Recipe Public Authoring Surface

Blueprint: `standard-recipe`

Primary category: `contract`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/verify_standard_recipe_public_authoring_surface`

Files:
- `verify_standard_recipe_public_authoring_surface.baseline.json`
- `verify_standard_recipe_public_authoring_surface.check.ts`
- `verify_standard_recipe_public_authoring_surface.rule.json`

Evidence: The check asserts public authoring keys, strict schemas, and hidden operation envelopes for standard stages.

Notes:
- Residual owner class: package-local contract validator; public authoring surface parity is package behavior, not topology.
- none
