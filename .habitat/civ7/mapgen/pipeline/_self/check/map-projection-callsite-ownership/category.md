# map-projection-callsite-ownership

Primary category: `boundaries`

Secondary categories: none

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `map-projection-callsite-ownership.baseline.json`
- `map-projection-callsite-ownership.check.mjs`
- `map-projection-callsite-ownership.rule.json`

Evidence: The check pins adapter projection callsites to dedicated projection steps and prevents physics-stage direct reads.

Notes:
- none
