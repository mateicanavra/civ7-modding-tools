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
- `preserve_standard_stage_topology_and_path_invariants.rule.json`
- `preserve_standard_stage_topology_and_path_invariants.structure.toml`

Evidence: The structure check asserts the standard stage directory topology, required active stage directories, required active `index.ts` files, aggregate/helper roots, public-config helper files, and retired direct-child names.

Notes:
- Literal `orderStandardStages({ ... })` key order is owned by `verify_standard_recipe_declared_stage_keys`.
- Legacy stage alias bans are owned by `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`.
- Single foundation-stage uniqueness was demoted after the accepted decomposed foundation topology introduced the five foundation stages.
