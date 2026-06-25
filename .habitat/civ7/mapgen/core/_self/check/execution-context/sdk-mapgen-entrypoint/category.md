# sdk-mapgen-entrypoint

Primary category: `execution-context`

Secondary categories: `boundaries`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/core`

Artifact kind: `check`

Files:
- `sdk-mapgen-entrypoint.baseline.json`
- `sdk-mapgen-entrypoint.pattern.md`
- `sdk-mapgen-entrypoint.rule.json`
- `sdk-mapgen-entrypoint.rule.mjs`

Evidence: The pattern keeps the general SDK runtime-neutral and makes MapGen bindings an explicit opt-in subpath.

Notes:
- Runtime neutrality is the purpose; import shape is the enforcement surface.
