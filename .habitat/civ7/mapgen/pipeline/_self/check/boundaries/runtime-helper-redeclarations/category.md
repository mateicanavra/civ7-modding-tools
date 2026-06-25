# runtime-helper-redeclarations

Primary category: `boundaries`

Secondary categories: `domain-policy`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `runtime-helper-redeclarations.apply.pattern.md`
- `runtime-helper-redeclarations.baseline.json`
- `runtime-helper-redeclarations.pattern.md`
- `runtime-helper-redeclarations.rule.json`
- `runtime-helper-redeclarations.rule.mjs`

Evidence: The pattern prevents runtime layers from redeclaring helpers whose ownership belongs in shared mapgen-core surfaces.

Notes:
- Reclassified from domain-policy because the universal failure is helper ownership leakage; semantic determinism remains a secondary concern.
