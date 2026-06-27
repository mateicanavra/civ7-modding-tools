# Require Narrow Game-UI Bridge Bootstrap

Subject ID: `require_narrow_game_ui_bridge_bootstrap`

Title: Require Narrow Game-UI Bridge Bootstrap

Blueprint: `intelligence-bridge`

Primary category: `boundary`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/intelligence-bridge/boundary/check/require_narrow_game_ui_bridge_bootstrap`

Files:
- `require_narrow_game_ui_bridge_bootstrap.baseline.json`
- `require_narrow_game_ui_bridge_bootstrap.check.ts`
- `require_narrow_game_ui_bridge_bootstrap.rule.json`

Evidence: The check requires the bridge UI bootstrap to use the narrow game-ui entrypoint and avoid root oRPC/client-server primitives.

Notes:
- Residual owner class: future owner gap; bridge bootstrap source-shape assertions should become Grit when required-shape patterns are extracted.
- none
