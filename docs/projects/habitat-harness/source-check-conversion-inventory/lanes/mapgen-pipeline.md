# mapgen-pipeline Lane Inventory

Status: inspected lane findings

Assigned surface: `.habitat/civ7/mapgen/pipeline/**`

Coverage:

- Rule records inspected: 17
- Related source-check adapters inspected: 12
- Existing pattern authority candidates inspected: 12
- Command-check executors inspected: 7

## Summary

This lane is heavily Grit-ready. Most adapter-backed rules already have
`.pattern.md` files that directly expose the adapter predicate: import-source
bans, call/property bans, path-scoped property matches, and path-scoped source
tokens. Those should be the first extraction cluster because deleting their
adapters collapses state without redesigning command-check or package validators.

The rows that should not be forced into Grit are the ones that execute package
modules, compare generated artifacts, or validate derived authoring-model
semantics. Those should move toward package-local validators, generated artifact
currentness proof, or a small data-driven structural topology rule.

## Disposition Counts

| Disposition | Count | Rows |
| --- | ---: | --- |
| `grit_pattern_authority` | 12 | `prohibit_ambient_rng_in_authored_generation`, `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`, `prohibit_wrapper_only_advanced_config`, `prohibit_sibling_stage_private_step_imports`, `require_shared_visualization_contracts_at_stage_surfaces`, `prohibit_bare_value_export_all_from_contract_surfaces`, `prohibit_empty_object_defaults_in_contract_schemas`, `require_typed_dependency_and_effect_tag_constants`, `prohibit_runtime_calls_to_runvalidated`, `prohibit_runtime_local_config_default_merging`, `prohibit_runtime_validation_and_compiler_imports`, `require_runtime_domain_op_bundle_imports` |
| `needs_split` | 3 | `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces`, `verify_standard_recipe_public_authoring_surface`, `preserve_standard_stage_topology_and_path_invariants` |
| `package_local_test_or_validator` | 2 | `verify_standard_recipe_artifacts_match_source_stages`, `verify_runtime_stage_order_matches_contract_manifest` |

## First Grit Candidates

Highest-confidence direct conversions:

- `prohibit_wrapper_only_advanced_config`: adapter is only path scope plus `advanced` property-name occurrence.
- `prohibit_sibling_stage_private_step_imports`: adapter is path-scoped import-source matching.
- `require_runtime_domain_op_bundle_imports`: adapter is one import-source regex on recipe files.
- `prohibit_runtime_validation_and_compiler_imports`: import-source bans with runtime path scope.
- `prohibit_runtime_calls_to_runvalidated`: direct/property call-expression ban with runtime path scope.
- `require_typed_dependency_and_effect_tag_constants`: runtime helper is already expressed as a Grit `defineStep` predicate.
- `require_shared_visualization_contracts_at_stage_surfaces`: runtime helper branches are already visible as Grit path/import cases.

These are better first moves than the command-check rows because each adapter
can disappear after the pattern path is wired, and none depends on generated
output or package execution.

## Split Candidates

- `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces`: category notes already identify this as mixed. Split ecology terminology/fudge policy, scoped runtime RNG/helper bans, and legacy official generator surfaces before conversion. Most sub-assertions are still Grit-shaped.
- `preserve_standard_stage_topology_and_path_invariants`: split retired alias text bans from exact stage order, foundation path uniqueness, and map-stage directory topology. The alias bans are Grit-shaped; topology wants data-driven structural proof or a manifest-backed checker.
- `verify_standard_recipe_public_authoring_surface`: split stage-id/topology overlap from public schema derivation, strict object schema checks, raw operation envelope checks, and focus-path semantics. The latter are package authoring-model validators, not Grit authority.

## Keep Out Of Grit

- `verify_standard_recipe_artifacts_match_source_stages`: imports runtime stages, mapgen-core authoring/normalization, generated artifacts, and map config validation. This is generated artifact currentness/package behavior proof.
- `verify_runtime_stage_order_matches_contract_manifest`: compares exported runtime stages to exported contract manifest data. This should become package-local validator or be collapsed by deriving one surface from the other.

## Notable Data Quality Findings

- `prohibit_ambient_rng_in_authored_generation` and
  `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` had stale
  source-check adapters despite `ownerTool: command-check`; those adapters were
  deleted in the canary. The remaining question is command-check split or
  consolidation.
- `prohibit_ambient_rng_in_authored_generation` has a current exception in the
  command-check/source-check behavior for discovery materialization; carry or
  intentionally remove that exception before deleting the command/check path.
- Existing `.pattern.md` fixtures are useful pattern authority examples, not
  runtime fixtures. Leave them local to their patterns.

## Blockers

No lane-local blockers.
