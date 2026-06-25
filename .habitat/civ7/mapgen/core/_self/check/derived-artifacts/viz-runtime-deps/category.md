# viz-runtime-deps

Primary category: `derived-artifacts`

Secondary categories: `execution-context`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/core`

Artifact kind: `check`

Files:
- `viz-runtime-deps.baseline.json`
- `viz-runtime-deps.check.mjs`
- `viz-runtime-deps.rule.json`

Evidence: The check requires built adapter/core/viz artifacts needed by Studio worker and browser diagnostics.

Notes:
- This is a read-only currentness/prerequisite check; it should not rebuild artifacts.
