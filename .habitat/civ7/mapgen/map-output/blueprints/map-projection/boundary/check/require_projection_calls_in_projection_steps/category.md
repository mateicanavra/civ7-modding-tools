# Require Projection Calls In Projection Steps

Subject ID: `require_projection_calls_in_projection_steps`

Title: Require Projection Calls In Projection Steps

Blueprint: `map-projection`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/require_projection_calls_in_projection_steps`

Files:
- `require_projection_calls_in_projection_steps.baseline.json`
- `require_projection_calls_in_projection_steps.check.mjs`
- `require_projection_calls_in_projection_steps.rule.json`

Evidence: The check requires dedicated projection step callsites and plotRivers materialization/contract tokens.

Notes:
- Residual owner class: package-local validator; projection call placement still has runtime/source-shape assertions not yet admitted to a narrower owner.
- Source-placement prohibitions moved to `prohibit_misplaced_projection_adapter_calls`.
