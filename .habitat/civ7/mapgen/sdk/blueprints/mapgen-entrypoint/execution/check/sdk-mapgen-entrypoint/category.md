# sdk-mapgen-entrypoint

Blueprint: `mapgen-entrypoint`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/sdk/blueprints/mapgen-entrypoint/execution/check/sdk-mapgen-entrypoint`

Files:
- `sdk-mapgen-entrypoint.baseline.json`
- `sdk-mapgen-entrypoint.pattern.md`
- `sdk-mapgen-entrypoint.rule.json`
- `sdk-mapgen-entrypoint.rule.mjs`

Evidence: The pattern keeps the general SDK runtime-neutral and makes MapGen bindings an explicit opt-in subpath.

Notes:
- Runtime neutrality is the purpose; import shape is the enforcement surface.
