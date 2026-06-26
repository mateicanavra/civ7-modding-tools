# map-projection-callsite-ownership

Blueprint: `map-output`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/map-output/boundary/check/map-projection-callsite-ownership`

Files:
- `map-projection-callsite-ownership.baseline.json`
- `map-projection-callsite-ownership.check.mjs`
- `map-projection-callsite-ownership.rule.json`

Evidence: The check pins adapter projection callsites to dedicated projection steps and prevents physics-stage direct reads.

Notes:
- none
