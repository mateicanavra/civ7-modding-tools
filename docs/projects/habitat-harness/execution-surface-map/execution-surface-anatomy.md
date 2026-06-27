# Execution Surface Anatomy

This companion report separates runnable behavior from adapter glue, runner/runtime code, policy predicates, fixture/support files, and transient dependencies. It is analysis only; it does not decide removals.

## Read

- No active source-check `.rule.mjs` modules remain.
- No `.rule.mjs` module currently shows separable fixture/support-file signals.
- Grit pattern examples in `.pattern.md` are not treated as fixture/support unless a runtime consumes them as separate support files.
- Build/currentness and package-local command ties are flagged as transient dependency candidates for later pruning.

## Anatomy Roles

| role | surface count |
| --- | --- |
| policy-predicate | 92 |
| transient-dependency | 182 |
| adapter | 125 |
| entrypoint | 233 |
| fixture-support | 9 |
| runner-runtime | 124 |

## Surface Families

| family | count | sample read |
| --- | --- | --- |
| apply-pattern | 2 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| pattern | 82 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_domain_entrypoint_self_reexports/prohibit_domain_entrypoint_self_reexports.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| rule-json | 125 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text. |
| check-script | 31 | .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.check.mjs: Command-check executable surface invoked through Habitat metadata or direct references. |
| structure-spec | 8 | .habitat/civ7/mapgen/domain/blueprints/domain-operation/structure/check/require_domain_ops_root_presence/require_domain_ops_root_presence.structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner.<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/structure/check/prohibit_domain_artifacts_modules/prohibit_domain_artifacts_modules.structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner.<br>.habitat/civ7/mapgen/domain/blueprints/ecology-domain/structure/check/require_ecology_canonical_op_module_topology/require_ecology_canonical_op_module_topology.structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner. |
| fix-script | 1 | .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.fix.mjs: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| operation-note | 2 | .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.operation.md: Classified execution surface.<br>.habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.operation.md: Classified execution surface. |
| generate-script | 1 | .habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.generate.sh: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| package-script | 136 | apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-target | 55 | apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-plugin | 1 | nx.json: Classified execution surface. |
| nx-target-default | 9 | nx.json: Classified execution surface.<br>nx.json: Classified execution surface.<br>nx.json: Classified execution surface. |
| habitat-cli-source | 124 | tools/habitat/src/cli/base/HabitatCommand.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/check.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/classify.ts: Toolkit runner/provider code that executes or routes rule surfaces. |

## Source-Check Rule Modules

- Modules: 0
- Expected adapter export shape: 0
- Transitional runtime imports: 0
- Separable fixture/support candidates: 0

_None._

## Transient Dependency Candidates

| path | kind | signals |
| --- | --- | --- |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_domain_entrypoint_self_reexports/prohibit_domain_entrypoint_self_reexports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_domain_tag_artifact_shim_imports/prohibit_domain_tag_artifact_shim_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_decomposed_ops_legacy_internal_imports/prohibit_foundation_decomposed_ops_legacy_internal_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_duplicate_math_helper_redefinitions/prohibit_foundation_duplicate_math_helper_redefinitions.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_rules_tectonics_shim_reexports/prohibit_foundation_rules_tectonics_shim_reexports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_strategy_nonlocal_imports/prohibit_foundation_strategy_nonlocal_imports.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_foundation_strategy_shared_tectonics_lib_imports/prohibit_foundation_strategy_shared_tectonics_lib_imports.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_hydrology_climate_intervention_tokens/prohibit_hydrology_climate_intervention_tokens.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/prohibit_hydrology_narrative_domain_imports/prohibit_hydrology_narrative_domain_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_foundation_legacy_aggregate_tectonic_op_surface/prohibit_foundation_legacy_aggregate_tectonic_op_surface.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_foundation_stage_cast_merge_hacks/prohibit_foundation_stage_cast_merge_hacks.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_foundation_stage_sentinel_passthrough/prohibit_foundation_stage_sentinel_passthrough.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_hydrology_map_config_key_tokens/prohibit_hydrology_map_config_key_tokens.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/contract/check/prohibit_unknown_bag_config_usage/prohibit_unknown_bag_config_usage.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/execution/check/prohibit_rng_callback_state_in_ops/prohibit_rng_callback_state_in_ops.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_narrative_swatches_stage_token/prohibit_narrative_swatches_stage_token.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_adapter_context_imports_from_domain_ops/block_adapter_context_imports_from_domain_ops.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_engine_runtime_imports_from_domain_ops/block_engine_runtime_imports_from_domain_ops.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops/prohibit_root_config_facade_imports_in_domain_ops.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops/prohibit_runtime_orchestration_helpers_in_domain_ops.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_recipe_imports_in_domain_source/prohibit_recipe_imports_in_domain_source.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_relative_domain_reaches_from_recipes_and_maps/prohibit_relative_domain_reaches_from_recipes_and_maps.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_domain_contract_roots_in_step_contracts/require_domain_contract_roots_in_step_contracts.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/restrict_recipes_to_public_domain_surfaces/restrict_recipes_to_public_domain_surfaces.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/boundary/check/prohibit_foundation_tectonics_rules_reexport_shims/prohibit_foundation_tectonics_rules_reexport_shims.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/boundary/check/prohibit_foundation_tectonics_strategy_nonlocal_imports/prohibit_foundation_tectonics_strategy_nonlocal_imports.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/boundary/check/prohibit_foundation_tectonics_strategy_shim_imports/prohibit_foundation_tectonics_strategy_shim_imports.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_foundation_advanced_cast_merge_fragments/prohibit_foundation_advanced_cast_merge_fragments.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_foundation_contract_config_bags/prohibit_foundation_contract_config_bags.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_foundation_legacy_aggregate_tectonics/prohibit_foundation_legacy_aggregate_tectonics.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_foundation_legacy_plate_kinematics/prohibit_foundation_legacy_plate_kinematics.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_foundation_projection_legacy_motion_source/prohibit_foundation_projection_legacy_motion_source.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_legacy_compute_tectonics_token/prohibit_legacy_compute_tectonics_token.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_removed_foundation_profile_config_tokens/prohibit_removed_foundation_profile_config_tokens.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/prohibit_removed_foundation_wrap_polar_maturity_tokens/prohibit_removed_foundation_wrap_polar_maturity_tokens.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_legacy_morphology_module_imports/prohibit_legacy_morphology_module_imports.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_morphology_hotspot_overlay_publishers/prohibit_morphology_hotspot_overlay_publishers.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_morphology_overlay_implementation_reads/prohibit_morphology_overlay_implementation_reads.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/morphology-domain/boundary/check/prohibit_morphology_stage_config_bag_imports/prohibit_morphology_stage_config_bag_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/morphology-domain/contract/check/prohibit_legacy_morphology_config_keys/prohibit_legacy_morphology_config_keys.pattern.md | pattern | reaches package/app/mod boundary |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 161 |
| .habitat/_support/execution/README.md | README | 0 | 18 |
