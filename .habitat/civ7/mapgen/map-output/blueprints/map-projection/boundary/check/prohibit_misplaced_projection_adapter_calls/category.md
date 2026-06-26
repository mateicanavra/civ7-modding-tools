# Prohibit Misplaced Projection Adapter Calls

Subject ID: `prohibit_misplaced_projection_adapter_calls`

Title: Prohibit Misplaced Projection Adapter Calls

Blueprint: `map-projection`

Primary category: `boundary`

Secondary categories: `structure`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/prohibit_misplaced_projection_adapter_calls`

Files:
- `prohibit_misplaced_projection_adapter_calls.baseline.json`
- `prohibit_misplaced_projection_adapter_calls.pattern.md`
- `prohibit_misplaced_projection_adapter_calls.rule.json`

Evidence: The pattern owns the source-placement prohibitions split out of `require_projection_calls_in_projection_steps`.

Notes:
- Required call presence and plotRivers materialization tokens remain command/data-driven assertions in `require_projection_calls_in_projection_steps`.
