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
| policy-predicate | 38 |
| transient-dependency | 141 |
| adapter | 73 |
| entrypoint | 235 |
| fixture-support | 9 |
| runner-runtime | 124 |

## Surface Families

| family | count | sample read |
| --- | --- | --- |
| apply-pattern | 2 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| pattern | 36 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| rule-json | 73 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text. |
| check-script | 33 | .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.check.mjs: Command-check executable surface invoked through Habitat metadata or direct references. |
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
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
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
| .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.check.ts | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.rule.json | rule-json | build/currentness or ordering tie |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/prohibit_domain_ops_projection_effect_dependencies/prohibit_domain_ops_projection_effect_dependencies.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/require_projection_calls_in_projection_steps/require_projection_calls_in_projection_steps.check.mjs | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/contract/check/preserve_physics_to_map_projection_contracts/preserve_physics_to_map_projection_contracts.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/placement-outcome/boundary/check/require_typed_placement_outcomes_before_apply/require_typed_placement_outcomes_before_apply.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/map-output/blueprints/shipped-map-catalog/artifact/check/block_studio_config_leakage_into_shipped_catalog/block_studio_config_leakage_into_shipped_catalog.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation/prohibit_ambient_rng_in_authored_generation.check.mjs | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_wrapper_only_advanced_config/prohibit_wrapper_only_advanced_config.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/artifact/check/verify_standard_recipe_artifacts_match_source_stages/verify_standard_recipe_artifacts_match_source_stages.check.ts | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/prohibit_sibling_stage_private_step_imports/prohibit_sibling_stage_private_step_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/require_shared_visualization_contracts_at_stage_surfaces/require_shared_visualization_contracts_at_stage_surfaces.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_bare_value_export_all_from_contract_surfaces/prohibit_bare_value_export_all_from_contract_surfaces.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_empty_object_defaults_in_contract_schemas/prohibit_empty_object_defaults_in_contract_schemas.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/require_typed_dependency_and_effect_tag_constants/require_typed_dependency_and_effect_tag_constants.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/verify_standard_recipe_public_authoring_surface/verify_standard_recipe_public_authoring_surface.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_calls_to_runvalidated/prohibit_runtime_calls_to_runvalidated.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_local_config_default_merging/prohibit_runtime_local_config_default_merging.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_validation_and_compiler_imports/prohibit_runtime_validation_and_compiler_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/require_runtime_domain_op_bundle_imports/require_runtime_domain_op_bundle_imports.pattern.md | pattern | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/preserve_standard_stage_topology_and_path_invariants/preserve_standard_stage_topology_and_path_invariants.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/structure/check/verify_runtime_stage_order_matches_contract_manifest/verify_runtime_stage_order_matches_contract_manifest.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/sdk/blueprints/mapgen-entrypoint/execution/check/require_explicit_mapgen_sdk_opt_in/require_explicit_mapgen_sdk_opt_in.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/studio/blueprints/dev-runner/structure/check/enforce_studio_dev_runner_topology/enforce_studio_dev_runner_topology.check.ts | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current/verify_studio_recipe_artifacts_are_current.check.mjs | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current/verify_studio_recipe_artifacts_are_current.rule.json | rule-json | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/boundary/check/require_studio_ui_recipe_artifact_imports/require_studio_ui_recipe_artifact_imports.pattern.md | pattern | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/studio/blueprints/recipe-dag-service/boundary/check/require_recipe_dag_contract_metadata/require_recipe_dag_contract_metadata.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/studio/blueprints/rpc-daemon/structure/check/enforce_studio_rpc_eventhub_topology/enforce_studio_rpc_eventhub_topology.check.ts | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/studio/blueprints/worker-bundle/execution/check/ensure_studio_worker_bundle_is_browser_safe/ensure_studio_worker_bundle_is_browser_safe.check.mjs | check-script | reaches package/app/mod boundary |
| .habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/verify_visualization_runtime_build_artifacts/verify_visualization_runtime_build_artifacts.check.mjs | check-script | build/currentness or ordering tie; reaches package/app/mod boundary |
| .habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/verify_visualization_runtime_build_artifacts/verify_visualization_runtime_build_artifacts.rule.json | rule-json | build/currentness or ordering tie |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 161 |
| .habitat/_support/execution/README.md | README | 0 | 18 |
