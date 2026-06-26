# Verify Visualization Runtime Build Artifacts

Subject ID: `viz-runtime-deps`

Title: Verify Visualization Runtime Build Artifacts

Blueprint: `runtime-dependencies`

Primary category: `artifact`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/viz-runtime-deps`

Files:
- `viz-runtime-deps.baseline.json`
- `viz-runtime-deps.check.mjs`
- `viz-runtime-deps.rule.json`

Evidence: The check requires built adapter/core/viz artifacts needed by Studio worker and browser diagnostics.

Notes:
- This is a read-only currentness/prerequisite check; it should not rebuild artifacts.
