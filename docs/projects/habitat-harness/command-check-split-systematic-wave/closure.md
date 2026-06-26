# Closure

Status: closed.

## Final Counts

- Rules in scope: 12 remaining `needs_split` command-check rows from the prior matrix.
- Assertion rows inventoried: 91.
- Rule records after wave: 74.
- Owner-tool counts after wave: 36 `grit-check`, 31 `command-check`, 5 `file-layer`, 1 `format-check`, 1 `nx`.
- Disposition counts after wave: 44 `grit_pattern_authority`, 11 `data_driven_import_path_rule`, 14 `package_local_test_or_validator`, 5 `needs_split`.

## Implemented Moves

- Deleted `block_unapproved_base_standard_boundary_leaks`; its real import-boundary authority is already covered by `enforce_adapter_only_base_standard_imports`.
- Converted `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` from `command-check` to `grit-check`.
- Added `prohibit_misplaced_projection_adapter_calls` as the Grit split from `require_projection_calls_in_projection_steps`.
- Added `prohibit_recipe_dag_runtime_source_dependencies` as the Grit split from `require_recipe_dag_contract_metadata`.
- Updated `preserve_standard_stage_topology_and_path_invariants` to the current decomposed foundation stage topology and removed legacy alias duplication.
- Shrunk `require_projection_calls_in_projection_steps` to required callsite/materialization assertions.
- Shrunk `require_recipe_dag_contract_metadata` to required contract surfaces and local import-graph validation.

## Deleted Or Shrunk Scripts

- Deleted `.habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/block_unapproved_base_standard_boundary_leaks/`.
- Deleted `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces.check.ts`.
- Shrunk `preserve_standard_stage_topology_and_path_invariants.check.mjs`.
- Shrunk `require_projection_calls_in_projection_steps.check.mjs`.
- Shrunk `require_recipe_dag_contract_metadata.check.ts`.

## Retained Command-Check Rows

- `enforce_domain_refactor_boundary_profile`
- `preserve_decomposed_foundation_contract_surfaces`
- `preserve_morphology_contracts_and_overlay_ownership`
- `require_owned_domain_config_catalog_surfaces`
- `validate_mapgen_docs_anchors_and_references`

These are the remaining durable `needs_split` rows. Other retained command checks are now classified as data-driven topology/currentness or package-local validator ownership rather than mixed conversion candidates.

## Next Dominoes

1. Run a focused domain aggregate split over the four remaining domain bundles. Do not make one mega-pattern; extract narrower Grit packets and move exact contract/currentness branches to a data-driven structural owner.
2. Split `validate_mapgen_docs_anchors_and_references` into Markdown source-shape authority and filesystem/reference validation. Keep the current red reference failures visible.
3. Design the non-Grit topology/currentness owner for stage topology, Studio runner topology, generated artifact currentness, and package-derived authoring-model checks.

## Main Insight

The wave confirmed the working heuristic: Grit is the right owner for explicit source-shape prohibitions, but the biggest remaining confusion is not “more command-checks to convert.” It is mixed command scripts that smuggle topology, graph traversal, currentness, generated-output validation, and package-derived semantics into the same executable surface as source predicates.
