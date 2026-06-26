# adapter-boundary

Blueprint: `civ7-adapter`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/adapter-boundary`

Files:
- `adapter-boundary.baseline.json`
- `adapter-boundary.check.sh`
- `adapter-boundary.rule.json`

Evidence: The shell check scans package source for base-standard imports outside civ7-adapter.

Notes:
- Legacy command allowlist overlaps with adapter-base-standard-import.
