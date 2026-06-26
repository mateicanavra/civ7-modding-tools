# Execution Surface Anatomy

This companion report separates runnable behavior from adapter glue, runner/runtime code, policy predicates, fixture/support files, and transient dependencies. It is analysis only; it does not decide removals.

## Read

- `.rule.mjs` is currently a mixed surface: source-check adapter contract plus predicate payload.
- No `.rule.mjs` module currently shows separable fixture/support-file signals.
- Grit pattern examples in `.pattern.md` are not treated as fixture/support unless a runtime consumes them as separate support files.
- Build/currentness and package-local command ties are flagged as transient dependency candidates for later pruning.

## Anatomy Roles

| role | surface count |
| --- | --- |
| adapter | 99 |
| fixture-support | 35 |
| policy-predicate | 64 |
| transient-dependency | 149 |
| entrypoint | 236 |
| runner-runtime | 124 |

## Surface Families

| family | count | sample read |
| --- | --- | --- |
| rule-module | 26 | .habitat/_support/execution/source-check/adapters/block_adapter_context_imports_from_domain_ops.rule.mjs: Centralized temporary source-check adapter support: the runner imports this module, while diagnosticsForRule carries the legacy predicate payload.<br>.habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs: Centralized temporary source-check adapter support: the runner imports this module, while diagnosticsForRule carries the legacy predicate payload.<br>.habitat/_support/execution/source-check/adapters/preserve_mapgen_core_runtime_neutrality.rule.mjs: Centralized temporary source-check adapter support: the runner imports this module, while diagnosticsForRule carries the legacy predicate payload. |
| apply-pattern | 2 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| pattern | 36 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| rule-json | 73 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text. |
| check-script | 36 | .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.check.mjs: Command-check executable surface invoked through Habitat metadata or direct references. |
| fix-script | 1 | .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.fix.mjs: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| operation-note | 2 | .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.operation.md: Classified execution surface.<br>.habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.operation.md: Classified execution surface. |
| generate-script | 1 | .habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.generate.sh: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| package-script | 134 | apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-target | 55 | apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-plugin | 1 | nx.json: Classified execution surface. |
| nx-target-default | 9 | nx.json: Classified execution surface.<br>nx.json: Classified execution surface.<br>nx.json: Classified execution surface. |
| habitat-cli-source | 124 | tools/habitat/src/cli/base/HabitatCommand.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/check.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/classify.ts: Toolkit runner/provider code that executes or routes rule surfaces. |

## Source-Check Rule Modules

- Modules: 26
- Expected adapter export shape: 26
- Transitional runtime imports: 26
- Separable fixture/support candidates: 0

| runtime helper | module count | sample modules |
| --- | --- | --- |
| policy | 26 | .habitat/_support/execution/source-check/adapters/block_adapter_context_imports_from_domain_ops.rule.mjs<br>.habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs<br>.habitat/_support/execution/source-check/adapters/preserve_mapgen_core_runtime_neutrality.rule.mjs |
| diagnostic | 14 | .habitat/_support/execution/source-check/adapters/block_adapter_context_imports_from_domain_ops.rule.mjs<br>.habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs<br>.habitat/_support/execution/source-check/adapters/preserve_mapgen_core_runtime_neutrality.rule.mjs |
| pathMatches | 13 | .habitat/_support/execution/source-check/adapters/block_adapter_context_imports_from_domain_ops.rule.mjs<br>.habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs<br>.habitat/_support/execution/source-check/adapters/prohibit_bare_value_export_all_from_contract_surfaces.rule.mjs |
| sourceRefsMatching | 6 | .habitat/_support/execution/source-check/adapters/prohibit_recipe_imports_in_domain_source.rule.mjs<br>.habitat/_support/execution/source-check/adapters/prohibit_root_config_facade_imports_in_domain_ops.rule.mjs<br>.habitat/_support/execution/source-check/adapters/prohibit_runtime_validation_and_compiler_imports.rule.mjs |
| callExpressions | 3 | .habitat/_support/execution/source-check/adapters/prohibit_runtime_calls_to_runvalidated.rule.mjs<br>.habitat/_support/execution/source-check/adapters/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs<br>.habitat/_support/execution/source-check/adapters/require_typed_placement_outcomes_before_apply.rule.mjs |
| propertyCallExpressions | 3 | .habitat/_support/execution/source-check/adapters/prohibit_runtime_calls_to_runvalidated.rule.mjs<br>.habitat/_support/execution/source-check/adapters/prohibit_runtime_local_config_default_merging.rule.mjs<br>.habitat/_support/execution/source-check/adapters/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs |
| emptyObjectNullish | 1 | .habitat/_support/execution/source-check/adapters/prohibit_runtime_local_config_default_merging.rule.mjs |
| isMapgenCoreProductionSource | 1 | .habitat/_support/execution/source-check/adapters/preserve_mapgen_core_runtime_neutrality.rule.mjs |
| isTestPath | 1 | .habitat/_support/execution/source-check/adapters/require_sanctioned_direct_control_session_owners.rule.mjs |
| relativeDomainImportDiagnostics | 1 | .habitat/_support/execution/source-check/adapters/prohibit_relative_domain_reaches_from_recipes_and_maps.rule.mjs |
| sdkMapgenEntrypointDiagnostics | 1 | .habitat/_support/execution/source-check/adapters/require_explicit_mapgen_sdk_opt_in.rule.mjs |
| stageContractDependencyDiagnostics | 1 | .habitat/_support/execution/source-check/adapters/require_typed_dependency_and_effect_tag_constants.rule.mjs |
| ts | 1 | .habitat/_support/execution/source-check/adapters/prohibit_empty_object_defaults_in_contract_schemas.rule.mjs |
| vizContractOwnershipDiagnostics | 1 | .habitat/_support/execution/source-check/adapters/require_shared_visualization_contracts_at_stage_surfaces.rule.mjs |

## Transient Dependency Candidates

| path | kind | signals |
| --- | --- | --- |
| .habitat/_support/execution/source-check/adapters/block_adapter_context_imports_from_domain_ops.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs | rule-module | imports transitional source-check runtime; reaches package/app/mod boundary |
| .habitat/_support/execution/source-check/adapters/preserve_mapgen_core_runtime_neutrality.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_bare_value_export_all_from_contract_surfaces.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_domain_ops_projection_effect_dependencies.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_empty_object_defaults_in_contract_schemas.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_recipe_imports_in_domain_source.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_relative_domain_reaches_from_recipes_and_maps.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_retired_domain_root_catalogs.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_root_config_facade_imports_in_domain_ops.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_calls_to_runvalidated.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_local_config_default_merging.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_validation_and_compiler_imports.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_sibling_stage_private_step_imports.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/prohibit_wrapper_only_advanced_config.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_domain_contract_roots_in_step_contracts.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_explicit_mapgen_sdk_opt_in.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_public_domain_surfaces_in_recipes_and_maps.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_runtime_domain_op_bundle_imports.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_sanctioned_direct_control_session_owners.rule.mjs | rule-module | imports transitional source-check runtime; reaches package/app/mod boundary |
| .habitat/_support/execution/source-check/adapters/require_shared_visualization_contracts_at_stage_surfaces.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_studio_ui_recipe_artifact_imports.rule.mjs | rule-module | imports transitional source-check runtime; reaches package/app/mod boundary |
| .habitat/_support/execution/source-check/adapters/require_typed_dependency_and_effect_tag_constants.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/require_typed_placement_outcomes_before_apply.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/_support/execution/source-check/adapters/restrict_recipes_to_public_domain_surfaces.rule.mjs | rule-module | imports transitional source-check runtime |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_engine_runtime_imports_from_domain_ops/block_engine_runtime_imports_from_domain_ops.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_domain_contract_roots_in_step_contracts/require_domain_contract_roots_in_step_contracts.pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/restrict_recipes_to_public_domain_surfaces/restrict_recipes_to_public_domain_surfaces.pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.check.ts | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.rule.json | rule-json | build/currentness or ordering tie |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/require_projection_calls_in_projection_steps/require_projection_calls_in_projection_steps.check.mjs | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/contract/check/preserve_physics_to_map_projection_contracts/preserve_physics_to_map_projection_contracts.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/shipped-map-catalog/artifact/check/block_studio_config_leakage_into_shipped_catalog/block_studio_config_leakage_into_shipped_catalog.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation/prohibit_ambient_rng_in_authored_generation.check.mjs | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_wrapper_only_advanced_config/prohibit_wrapper_only_advanced_config.pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/artifact/check/verify_standard_recipe_artifacts_match_source_stages/verify_standard_recipe_artifacts_match_source_stages.check.ts | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_bare_value_export_all_from_contract_surfaces/prohibit_bare_value_export_all_from_contract_surfaces.pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/verify_standard_recipe_public_authoring_surface/verify_standard_recipe_public_authoring_surface.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/preserve_standard_stage_topology_and_path_invariants/preserve_standard_stage_topology_and_path_invariants.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/verify_runtime_stage_order_matches_contract_manifest/verify_runtime_stage_order_matches_contract_manifest.check.ts | check-script | reaches package/app/mod boundary |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 161 |
| .habitat/_support/execution/README.md | README | 0 | 20 |
| .habitat/_support/execution/source-check/adapters/block_adapter_context_imports_from_domain_ops.rule.mjs | block_adapter_context_imports_from_domain_ops.rule | 0 | 29 |
| .habitat/_support/execution/source-check/adapters/enforce_adapter_only_base_standard_imports.rule.mjs | enforce_adapter_only_base_standard_imports.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/preserve_mapgen_core_runtime_neutrality.rule.mjs | preserve_mapgen_core_runtime_neutrality.rule | 0 | 41 |
| .habitat/_support/execution/source-check/adapters/prohibit_bare_value_export_all_from_contract_surfaces.rule.mjs | prohibit_bare_value_export_all_from_contract_surfaces.rule | 0 | 18 |
| .habitat/_support/execution/source-check/adapters/prohibit_domain_ops_projection_effect_dependencies.rule.mjs | prohibit_domain_ops_projection_effect_dependencies.rule | 0 | 15 |
| .habitat/_support/execution/source-check/adapters/prohibit_empty_object_defaults_in_contract_schemas.rule.mjs | prohibit_empty_object_defaults_in_contract_schemas.rule | 0 | 21 |
| .habitat/_support/execution/source-check/adapters/prohibit_recipe_imports_in_domain_source.rule.mjs | prohibit_recipe_imports_in_domain_source.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/prohibit_relative_domain_reaches_from_recipes_and_maps.rule.mjs | prohibit_relative_domain_reaches_from_recipes_and_maps.rule | 0 | 9 |
| .habitat/_support/execution/source-check/adapters/prohibit_retired_domain_root_catalogs.rule.mjs | prohibit_retired_domain_root_catalogs.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/prohibit_root_config_facade_imports_in_domain_ops.rule.mjs | prohibit_root_config_facade_imports_in_domain_ops.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_calls_to_runvalidated.rule.mjs | prohibit_runtime_calls_to_runvalidated.rule | 0 | 17 |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_local_config_default_merging.rule.mjs | prohibit_runtime_local_config_default_merging.rule | 0 | 17 |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs | prohibit_runtime_orchestration_helpers_in_domain_ops.rule | 0 | 17 |
| .habitat/_support/execution/source-check/adapters/prohibit_runtime_validation_and_compiler_imports.rule.mjs | prohibit_runtime_validation_and_compiler_imports.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/prohibit_sibling_stage_private_step_imports.rule.mjs | prohibit_sibling_stage_private_step_imports.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/prohibit_wrapper_only_advanced_config.rule.mjs | prohibit_wrapper_only_advanced_config.rule | 0 | 16 |
| .habitat/_support/execution/source-check/adapters/require_domain_contract_roots_in_step_contracts.rule.mjs | require_domain_contract_roots_in_step_contracts.rule | 0 | 16 |
| .habitat/_support/execution/source-check/adapters/require_explicit_mapgen_sdk_opt_in.rule.mjs | require_explicit_mapgen_sdk_opt_in.rule | 0 | 9 |
| .habitat/_support/execution/source-check/adapters/require_public_domain_surfaces_in_recipes_and_maps.rule.mjs | require_public_domain_surfaces_in_recipes_and_maps.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/require_runtime_domain_op_bundle_imports.rule.mjs | require_runtime_domain_op_bundle_imports.rule | 0 | 14 |
| .habitat/_support/execution/source-check/adapters/require_sanctioned_direct_control_session_owners.rule.mjs | require_sanctioned_direct_control_session_owners.rule | 0 | 16 |
| .habitat/_support/execution/source-check/adapters/require_shared_visualization_contracts_at_stage_surfaces.rule.mjs | require_shared_visualization_contracts_at_stage_surfaces.rule | 0 | 9 |
| .habitat/_support/execution/source-check/adapters/require_studio_ui_recipe_artifact_imports.rule.mjs | require_studio_ui_recipe_artifact_imports.rule | 0 | 20 |
| .habitat/_support/execution/source-check/adapters/require_typed_dependency_and_effect_tag_constants.rule.mjs | require_typed_dependency_and_effect_tag_constants.rule | 0 | 9 |
| .habitat/_support/execution/source-check/adapters/require_typed_placement_outcomes_before_apply.rule.mjs | require_typed_placement_outcomes_before_apply.rule | 0 | 16 |
| .habitat/_support/execution/source-check/adapters/restrict_recipes_to_public_domain_surfaces.rule.mjs | restrict_recipes_to_public_domain_surfaces.rule | 0 | 18 |
| .habitat/_support/execution/source-check/runtime/rule-runtime.policy.mjs | rule-runtime.policy | 0 | 523 |
