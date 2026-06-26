# Prohibit Runtime Helper Redeclarations

Subject ID: `prohibit_runtime_helper_redeclarations`

Title: Prohibit Runtime Helper Redeclarations

Blueprint: `mapgen-core-library`

Primary category: `boundary`

Secondary categories: `policy`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations`

Files:
- `prohibit_runtime_helper_redeclarations.apply.pattern.md`
- `prohibit_runtime_helper_redeclarations.baseline.json`
- `prohibit_runtime_helper_redeclarations.pattern.md`
- `prohibit_runtime_helper_redeclarations.rule.json`

Evidence: The pattern prevents runtime layers from redeclaring helpers whose ownership belongs in shared mapgen-core surfaces.

Notes:
- Reclassified from policy because the universal failure is helper ownership leakage; semantic determinism remains a secondary concern.
