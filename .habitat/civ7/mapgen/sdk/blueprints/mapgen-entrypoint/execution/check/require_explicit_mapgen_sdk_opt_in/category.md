# Require Explicit MapGen SDK Opt-In

Subject ID: `require_explicit_mapgen_sdk_opt_in`

Title: Require Explicit MapGen SDK Opt-In

Blueprint: `mapgen-entrypoint`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/sdk/blueprints/mapgen-entrypoint/execution/check/require_explicit_mapgen_sdk_opt_in`

Files:
- `require_explicit_mapgen_sdk_opt_in.baseline.json`
- `require_explicit_mapgen_sdk_opt_in.pattern.md`
- `require_explicit_mapgen_sdk_opt_in.rule.json`

Evidence: The pattern keeps the general SDK runtime-neutral and makes MapGen bindings an explicit opt-in subpath.

Notes:
- Runtime neutrality is the purpose; import shape is the enforcement surface.
