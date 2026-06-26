# Preserve MapGen Core Runtime Neutrality

Subject ID: `preserve_mapgen_core_runtime_neutrality`

Title: Preserve MapGen Core Runtime Neutrality

Blueprint: `mapgen-core-library`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality`

Files:
- `preserve_mapgen_core_runtime_neutrality.baseline.json`
- `preserve_mapgen_core_runtime_neutrality.pattern.md`
- `preserve_mapgen_core_runtime_neutrality.rule.json`

Evidence: The pattern keeps mapgen-core production source independent from Civ7 runtime APIs and adapter imports.

Notes:
- Runtime neutrality is the primary universal purpose; the concrete failure often appears as a forbidden dependency.
