# Verify Visualization Runtime Build Artifacts

Subject ID: `verify_visualization_runtime_build_artifacts`

Title: Verify Visualization Runtime Build Artifacts

Blueprint: `runtime-dependencies`

Primary category: `artifact`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/verify_visualization_runtime_build_artifacts`

Files:
- `verify_visualization_runtime_build_artifacts.baseline.json`
- `verify_visualization_runtime_build_artifacts.check.mjs`
- `verify_visualization_runtime_build_artifacts.rule.json`

Evidence: The check requires built adapter/core/viz artifacts needed by Studio worker and browser diagnostics.

Notes:
- Residual owner class: Nx/package artifact validator; runtime build artifact availability belongs to package/Nx preflight.
- This is a read-only currentness/prerequisite check; it should not rebuild artifacts.
