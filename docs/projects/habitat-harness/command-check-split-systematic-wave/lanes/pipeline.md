# Pipeline Lane

Status: handled assertion-level split for the assigned `mapgen-pipeline`
`needs_split` rows.

Rows:

- `preserve_standard_stage_topology_and_path_invariants`
- `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces`
- `verify_standard_recipe_public_authoring_surface`

## Outcomes

- `preserve_standard_stage_topology_and_path_invariants`: kept as
  command-check/data-driven topology. The retained assertions are standard
  stage order and extra `map-*` helper directory absence. The legacy-alias
  assertion is delegated to `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`;
  the single-foundation-stage assertion is demoted after the accepted
  decomposed foundation topology introduced the five `foundation-*` stages.
- `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces`: converted from
  command-check to Grit because all script branches are path-scoped source-token
  bans. The command script was deleted after the branches were represented in
  `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces.pattern.md`.
- `verify_standard_recipe_public_authoring_surface`: left unchanged. The main
  oracle imports live recipe stages and `deriveStageAuthoringModel`, then checks
  derived schema layer, strictness, public keys, raw envelope exposure, and step
  focus paths. That is package-local authoring-model validation, not clean Grit
  source-pattern authority.

## Proof

- `bun tools/habitat/bin/dev.ts check --rule preserve_standard_stage_topology_and_path_invariants --json` passed after topology repair.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_ecology_fudge_terms_and_legacy_generator_surfaces --tool grit-check --json` passed after Grit conversion.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_ecology_fudge_terms_and_legacy_generator_surfaces --json` passed through normal selected-rule routing after Grit conversion.
- `bun tools/habitat/bin/dev.ts check --rule verify_standard_recipe_public_authoring_surface --json` passed before changes; no packet edits were made.
- `bun tools/habitat/bin/dev.ts check --tool grit-check --json` returned `ok: true`; the output includes advisory docs checkout findings, but no enforced Grit failures.
- `bun tools/habitat/bin/dev.ts check --tool command-check --json` returned `ok: false` from non-pipeline inventory: `verify_studio_recipe_artifacts_are_current`, `validate_mapgen_docs_anchors_and_references`, and `validate_boundary_taxonomy_against_workspace_graph`. The assigned pipeline command-check rules passed and the converted ecology rule was absent from command-check.
- `git diff --check` passed.

Broader proof should remain lane-local until parallel wave edits settle, because
this worktree contains unrelated edits in other lanes and shared files.
