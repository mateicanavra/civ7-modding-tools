# adapter-boundary

Primary category: `boundaries`

Secondary categories: none

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/platform`

Artifact kind: `check`

Files:
- `adapter-boundary.baseline.json`
- `adapter-boundary.check.sh`
- `adapter-boundary.rule.json`

Evidence: The shell check scans package source for base-standard imports outside civ7-adapter.

Notes:
- Legacy command allowlist overlaps with adapter-base-standard-import.
