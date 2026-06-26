# Ensure Studio Worker Bundle Is Browser-Safe

Subject ID: `worker-bundle`

Title: Ensure Studio Worker Bundle Is Browser-Safe

Blueprint: `worker-bundle`

Primary category: `execution`

Secondary categories: `artifact`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/worker-bundle/execution/check/worker-bundle`

Files:
- `worker-bundle.baseline.json`
- `worker-bundle.check.mjs`
- `worker-bundle.rule.json`

Evidence: The check ensures the built browser worker bundle does not contain Node, base-standard, or runtime-only symbols.

Notes:
- none
