# Preserve Standard Stage Topology And Path Invariants

Subject ID: `preserve_standard_stage_topology_and_path_invariants`

Title: Preserve Standard Stage Topology And Path Invariants

Blueprint: `standard-recipe`

Primary category: `structure`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/preserve_standard_stage_topology_and_path_invariants`

Files:
- `preserve_standard_stage_topology_and_path_invariants.baseline.json`
- `preserve_standard_stage_topology_and_path_invariants.check.mjs`
- `preserve_standard_stage_topology_and_path_invariants.rule.json`

Evidence: The check asserts expected stage IDs/order and no extra map-stage dirs.

Notes:
- Legacy stage alias bans are owned by `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`.
- Single foundation-stage uniqueness was demoted after the accepted decomposed foundation topology introduced the five foundation stages.
