# Require Runtime Domain Op Bundle Imports

Subject ID: `recipe-runtime-domain-ops`

Title: Require Runtime Domain Op Bundle Imports

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/recipe-runtime-domain-ops`

Files:
- `recipe-runtime-domain-ops.baseline.json`
- `recipe-runtime-domain-ops.pattern.md`
- `recipe-runtime-domain-ops.rule.json`
- `recipe-runtime-domain-ops.rule.mjs`

Evidence: The pattern requires recipe runtime modules to import runtime op bundles rather than contract roots.

Notes:
- none
