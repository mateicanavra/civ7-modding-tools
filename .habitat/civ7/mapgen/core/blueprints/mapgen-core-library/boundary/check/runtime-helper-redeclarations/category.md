# runtime-helper-redeclarations

Blueprint: `mapgen-core-library`

Primary category: `boundary`

Secondary categories: `policy`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/runtime-helper-redeclarations`

Files:
- `runtime-helper-redeclarations.apply.pattern.md`
- `runtime-helper-redeclarations.baseline.json`
- `runtime-helper-redeclarations.pattern.md`
- `runtime-helper-redeclarations.rule.json`
- `runtime-helper-redeclarations.rule.mjs`

Evidence: The pattern prevents runtime layers from redeclaring helpers whose ownership belongs in shared mapgen-core surfaces.

Notes:
- Reclassified from policy because the universal failure is helper ownership leakage; semantic determinism remains a secondary concern.
