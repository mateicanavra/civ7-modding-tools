# Require Runtime Domain Op Bundle Imports

Subject ID: `require_runtime_domain_op_bundle_imports`

Title: Require Runtime Domain Op Bundle Imports

Blueprint: `standard-recipe`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/require_runtime_domain_op_bundle_imports`

Files:
- `require_runtime_domain_op_bundle_imports.baseline.json`
- `require_runtime_domain_op_bundle_imports.pattern.md`
- `require_runtime_domain_op_bundle_imports.rule.json`
- `require_runtime_domain_op_bundle_imports.rule.mjs`

Evidence: The pattern requires recipe runtime modules to import runtime op bundles rather than contract roots.

Notes:
- none
