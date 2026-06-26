# mapgen-core-runtime-civ7

Blueprint: `core-sdk`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/core-sdk/execution/check/mapgen-core-runtime-civ7`

Files:
- `mapgen-core-runtime-civ7.baseline.json`
- `mapgen-core-runtime-civ7.pattern.md`
- `mapgen-core-runtime-civ7.rule.json`
- `mapgen-core-runtime-civ7.rule.mjs`

Evidence: The pattern keeps mapgen-core production source independent from Civ7 runtime APIs and adapter imports.

Notes:
- Runtime neutrality is the primary universal purpose; the concrete failure often appears as a forbidden dependency.
