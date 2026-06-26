# Enforce Adapter-Only Base-Standard Imports

Subject ID: `adapter-base-standard-import`

Title: Enforce Adapter-Only Base-Standard Imports

Blueprint: `civ7-adapter`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/adapter-base-standard-import`

Files:
- `adapter-base-standard-import.baseline.json`
- `adapter-base-standard-import.pattern.md`
- `adapter-base-standard-import.rule.json`
- `adapter-base-standard-import.rule.mjs`

Evidence: The pattern confines runtime base-standard imports to the adapter package.

Notes:
- Overlaps with adapter-boundary; likely consolidation candidate.
