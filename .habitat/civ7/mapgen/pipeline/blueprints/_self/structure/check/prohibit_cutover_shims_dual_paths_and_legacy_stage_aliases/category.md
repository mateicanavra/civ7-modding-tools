# Prohibit Cutover Shims, Dual Paths, And Legacy Stage Aliases

Subject ID: `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`

Title: Prohibit Cutover Shims, Dual Paths, And Legacy Stage Aliases

Blueprint: `_self`

Primary category: `structure`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `transition`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`

Files:
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.baseline.json`
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.check.mjs`
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.pattern.md`
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.rule.json`

Evidence: The check scans runtime source for shim, shadow, comparison, dual-path, and legacy stage-token surfaces after cutover.

Notes:
- Residual owner class: future owner gap; transitional compatibility residue should be deleted or split in a later compatibility cleanup.
- Lifecycle is transition because this prevents regression to retired paths; transition is not a primary category.
