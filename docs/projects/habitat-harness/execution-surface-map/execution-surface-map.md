# Execution Surface Map

Deterministic analytics for the Habitat authority execution surface. This report maps what can be executed, who invokes it, and what it reaches into. `rule.json` is treated as runner metadata, not policy authority.

## Sanity Assertions

- Passed: 73 `.rule.json`, 33 `.rule.mjs`, 33 transitional runtime imports, root `docs:project`, and `tools/habitat` `generate:schemas` were detected.

## Surfaces By Kind

| kind | count |
| --- | --- |
| apply-pattern | 2 |
| pattern | 36 |
| rule-json | 73 |
| rule-module | 33 |
| check-script | 36 |
| fix-script | 1 |
| operation-note | 2 |
| generate-script | 1 |
| package-script | 134 |
| nx-target | 55 |
| nx-plugin | 1 |
| nx-target-default | 9 |
| habitat-cli-source | 124 |

## Surfaces By Role

| role | count |
| --- | --- |
| policy_pattern | 38 |
| runner_metadata | 73 |
| source_check_adapter | 33 |
| command_check_executor | 36 |
| operation_surface | 4 |
| workspace_entrypoint | 199 |
| toolkit_runner | 124 |

## Execution Anatomy Roles

| anatomy role | surface count |
| --- | --- |
| policy-predicate | 71 |
| transient-dependency | 179 |
| adapter | 106 |
| entrypoint | 236 |
| runner-runtime | 124 |

## `.rule.mjs` Anatomy

- Total modules: 33
- Expected export shape: 33
- Transitional runtime imports: 33
- Separable fixture/support candidates: 0
- Candidate extensions: .json, .ts, .tsx

| runtime helper | module count | sample modules |
| --- | --- | --- |
| policy | 33 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.mjs<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.mjs |
| diagnostic | 20 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.mjs<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.mjs |
| pathMatches | 16 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_adapter_context_imports_from_domain_ops/block_adapter_context_imports_from_domain_ops.rule.mjs |
| sourceRefsMatching | 7 | .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops/prohibit_root_config_facade_imports_in_domain_ops.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_recipe_imports_in_domain_source/prohibit_recipe_imports_in_domain_source.rule.mjs |
| callExpressions | 3 | .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs<br>.habitat/civ7/mapgen/map-output/blueprints/placement-outcome/boundary/check/require_typed_placement_outcomes_before_apply/require_typed_placement_outcomes_before_apply.rule.mjs<br>.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_calls_to_runvalidated/prohibit_runtime_calls_to_runvalidated.rule.mjs |
| propertyCallExpressions | 3 | .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs<br>.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_calls_to_runvalidated/prohibit_runtime_calls_to_runvalidated.rule.mjs<br>.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_local_config_default_merging/prohibit_runtime_local_config_default_merging.rule.mjs |
| emptyObjectNullish | 1 | .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_local_config_default_merging/prohibit_runtime_local_config_default_merging.rule.mjs |
| isActiveEcologyStagePath | 1 | .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.rule.mjs |
| isMapgenCoreProductionSource | 1 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.mjs |
| isRetiredEcologyPath | 1 | .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.rule.mjs |
| isRngAuthorityScope | 1 | .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation/prohibit_ambient_rng_in_authored_generation.rule.mjs |
| isSwooperRuntimeSource | 1 | .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.rule.mjs |
| isTestPath | 1 | .habitat/civ7/platform/blueprints/direct-control-session/boundary/check/require_sanctioned_direct_control_session_owners/require_sanctioned_direct_control_session_owners.rule.mjs |
| relativeDomainImportDiagnostics | 1 | .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_relative_domain_reaches_from_recipes_and_maps/prohibit_relative_domain_reaches_from_recipes_and_maps.rule.mjs |
| sdkMapgenEntrypointDiagnostics | 1 | .habitat/civ7/mapgen/sdk/blueprints/mapgen-entrypoint/execution/check/require_explicit_mapgen_sdk_opt_in/require_explicit_mapgen_sdk_opt_in.rule.mjs |
| stageContractDependencyDiagnostics | 1 | .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/require_typed_dependency_and_effect_tag_constants/require_typed_dependency_and_effect_tag_constants.rule.mjs |
| ts | 1 | .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_empty_object_defaults_in_contract_schemas/prohibit_empty_object_defaults_in_contract_schemas.rule.mjs |
| vizContractOwnershipDiagnostics | 1 | .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/require_shared_visualization_contracts_at_stage_surfaces/require_shared_visualization_contracts_at_stage_surfaces.rule.mjs |

## `.rule.mjs` Module Details

| path | candidate extensions | runtime helpers | regex literals | support signals |
| --- | --- | --- | --- | --- |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.mjs | .ts | diagnostic, pathMatches, policy | 9 | none |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.mjs | .ts | diagnostic, isMapgenCoreProductionSource, policy | 9 | none |
| .habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.mjs | .ts | diagnostic, pathMatches, policy | 9 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_adapter_context_imports_from_domain_ops/block_adapter_context_imports_from_domain_ops.rule.mjs | .ts | diagnostic, pathMatches, policy | 11 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_engine_runtime_imports_from_domain_ops/block_engine_runtime_imports_from_domain_ops.rule.mjs | .ts | diagnostic, pathMatches, policy | 9 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.rule.mjs | .ts | policy, sourceRefsMatching | 13 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops/prohibit_root_config_facade_imports_in_domain_ops.rule.mjs | .ts | policy, sourceRefsMatching | 9 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs | .ts | callExpressions, diagnostic, pathMatches, policy, propertyCallExpressions | 10 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_recipe_imports_in_domain_source/prohibit_recipe_imports_in_domain_source.rule.mjs | .ts | policy, sourceRefsMatching | 9 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_relative_domain_reaches_from_recipes_and_maps/prohibit_relative_domain_reaches_from_recipes_and_maps.rule.mjs | .ts | policy, relativeDomainImportDiagnostics | 7 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_domain_contract_roots_in_step_contracts/require_domain_contract_roots_in_step_contracts.rule.mjs | .ts | policy | 12 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.rule.mjs | .ts, .tsx | policy, sourceRefsMatching | 11 | none |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/restrict_recipes_to_public_domain_surfaces/restrict_recipes_to_public_domain_surfaces.rule.mjs | .ts | diagnostic, pathMatches, policy | 14 | none |
| .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.rule.mjs | .ts | diagnostic, isActiveEcologyStagePath, isRetiredEcologyPath, policy | 8 | none |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/prohibit_domain_ops_projection_effect_dependencies/prohibit_domain_ops_projection_effect_dependencies.rule.mjs | .ts | diagnostic, pathMatches, policy | 8 | none |
| .habitat/civ7/mapgen/map-output/blueprints/placement-outcome/boundary/check/require_typed_placement_outcomes_before_apply/require_typed_placement_outcomes_before_apply.rule.mjs | .ts | callExpressions, diagnostic, pathMatches, policy | 8 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation/prohibit_ambient_rng_in_authored_generation.rule.mjs | .ts | diagnostic, isRngAuthorityScope, policy | 9 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.rule.mjs | .ts | diagnostic, isSwooperRuntimeSource, policy | 7 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_wrapper_only_advanced_config/prohibit_wrapper_only_advanced_config.rule.mjs | .json, .ts | diagnostic, pathMatches, policy | 8 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/prohibit_sibling_stage_private_step_imports/prohibit_sibling_stage_private_step_imports.rule.mjs | .ts | policy, sourceRefsMatching | 11 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/require_shared_visualization_contracts_at_stage_surfaces/require_shared_visualization_contracts_at_stage_surfaces.rule.mjs | .ts | policy, vizContractOwnershipDiagnostics | 7 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_bare_value_export_all_from_contract_surfaces/prohibit_bare_value_export_all_from_contract_surfaces.rule.mjs | .ts | diagnostic, pathMatches, policy | 9 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_empty_object_defaults_in_contract_schemas/prohibit_empty_object_defaults_in_contract_schemas.rule.mjs | .ts | diagnostic, pathMatches, policy, ts | 9 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/require_typed_dependency_and_effect_tag_constants/require_typed_dependency_and_effect_tag_constants.rule.mjs | .ts | policy, stageContractDependencyDiagnostics | 7 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_calls_to_runvalidated/prohibit_runtime_calls_to_runvalidated.rule.mjs | .ts | callExpressions, diagnostic, pathMatches, policy, propertyCallExpressions | 9 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_local_config_default_merging/prohibit_runtime_local_config_default_merging.rule.mjs | .ts | diagnostic, emptyObjectNullish, pathMatches, policy, propertyCallExpressions | 8 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_validation_and_compiler_imports/prohibit_runtime_validation_and_compiler_imports.rule.mjs | .ts | policy, sourceRefsMatching | 10 | none |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/require_runtime_domain_op_bundle_imports/require_runtime_domain_op_bundle_imports.rule.mjs | .ts | policy, sourceRefsMatching | 10 | none |
| .habitat/civ7/mapgen/sdk/blueprints/mapgen-entrypoint/execution/check/require_explicit_mapgen_sdk_opt_in/require_explicit_mapgen_sdk_opt_in.rule.mjs | .ts | policy, sdkMapgenEntrypointDiagnostics | 7 | none |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/boundary/check/require_studio_ui_recipe_artifact_imports/require_studio_ui_recipe_artifact_imports.rule.mjs | .ts, .tsx | policy | 13 | none |
| .habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/enforce_adapter_only_base_standard_imports/enforce_adapter_only_base_standard_imports.rule.mjs | .ts | diagnostic, pathMatches, policy | 10 | none |
| .habitat/civ7/platform/blueprints/control-orpc/boundary/check/preserve_transport_pure_orpc_contracts/preserve_transport_pure_orpc_contracts.rule.mjs | .ts | diagnostic, pathMatches, policy | 10 | none |
| .habitat/civ7/platform/blueprints/direct-control-session/boundary/check/require_sanctioned_direct_control_session_owners/require_sanctioned_direct_control_session_owners.rule.mjs | .ts, .tsx | diagnostic, isTestPath, pathMatches, policy | 12 | none |

## Fixture/Support Files

_None._

## Entrypoints By Invoker

| invoker | count |
| --- | --- |
| unknown | 6 |
| habitat | 301 |
| direct-script | 38 |
| package | 135 |
| nx | 65 |

## Buckets

| bucket | count |
| --- | --- |
| mutation_surface | 121 |
| package_boundary_tie | 66 |
| unknown_invocation | 6 |
| habitat_invoked | 301 |
| transitional_runtime_tie | 34 |
| nx_ordering_tie | 105 |
| direct_script_invoked | 38 |
| package_invoked | 200 |

## Top Cross-Boundary Ties By Fanout

| target class | target | source count | references | sample sources |
| --- | --- | --- | --- | --- |
| habitat-authority | .habitat/habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs | 34 | 67 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.mjs<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.mjs<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.mjs |
| workspace-tool | git | 26 | 26 | .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.check.mjs<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.check.mjs<br>.habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.check.mjs |
| habitat-toolkit | @habitat/cli/resources/command/index | 22 | 22 | tools/habitat/src/providers/biome/index.ts<br>tools/habitat/src/providers/git/index.ts<br>tools/habitat/src/providers/graphite/index.ts |
| habitat-toolkit | @habitat/cli/service/model/check/index | 21 | 21 | tools/habitat/src/cli/commands/check.ts<br>tools/habitat/src/cli/commands/verify.ts<br>tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts |
| workspace-tool | bun | 20 | 38 | .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.rule.json<br>.habitat/civ7/mapgen/map-output/blueprints/shipped-map-catalog/artifact/check/block_studio_config_leakage_into_shipped_catalog/block_studio_config_leakage_into_shipped_catalog.rule.json<br>.habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces.rule.json |
| workspace-tool | grit<br>language js(typescript)<br><br>or { | 18 | 18 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_adapter_context_imports_from_domain_ops/block_adapter_context_imports_from_domain_ops.pattern.md<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops/prohibit_runtime_orchestration_helpers_in_domain_ops.pattern.md |
| workspace-tool | tsc -p tsconfig.json --noEmit | 17 | 17 | apps/docs/package.json#scripts.check<br>apps/docs/package.json#scripts.check:ts<br>apps/playground/package.json#scripts.check |
| workspace-tool | node -e "" | 15 | 15 | apps/docs/project.json#targets.build<br>apps/mapgen-studio/project.json#targets.build<br>mods/mod-civ7-intelligence-bridge/project.json#targets.build |
| habitat-toolkit | @habitat/cli/service/model/rules/index | 14 | 14 | tools/habitat/src/providers/grit/diagnostics.ts<br>tools/habitat/src/providers/grit/docs-apply.ts<br>tools/habitat/src/providers/grit/failure.ts |
| mod | mods/ | 12 | 12 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.apply.pattern.md<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.pattern.md<br>.habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_relative_domain_reaches_from_recipes_and_maps/prohibit_relative_domain_reaches_from_recipes_and_maps.pattern.md |
| relative | ./types.js | 11 | 21 | .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_bare_value_export_all_from_contract_surfaces/prohibit_bare_value_export_all_from_contract_surfaces.pattern.md<br>tools/habitat/src/providers/grit/diagnostics.ts<br>tools/habitat/src/providers/grit/index.ts |
| habitat-toolkit | @habitat/cli/service/model/workspace/index | 10 | 10 | tools/habitat/src/providers/nx/graph.ts<br>tools/habitat/src/providers/nx/index.ts<br>tools/habitat/src/providers/nx/inventory.ts |
| workspace-tool | biome check . | 10 | 10 | mods/mod-swooper-civ-dacia/package.json#scripts.lint<br>mods/mod-swooper-maps/package.json#scripts.lint<br>package.json#scripts.biome:check |
| relative | ../dto/pattern-management.schema.js | 9 | 18 | tools/habitat/src/service/modules/fix/model/policy/pattern-admission.policy.ts<br>tools/habitat/src/service/modules/fix/model/policy/pattern-apply-admissions.policy.ts<br>tools/habitat/src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts |
| habitat-toolkit | @habitat/cli/resources/config/index | 9 | 9 | tools/habitat/src/providers/biome/index.ts<br>tools/habitat/src/providers/git/index.ts<br>tools/habitat/src/providers/graphite/index.ts |
| habitat-toolkit | @habitat/cli/service/model/diagnostics/index | 9 | 9 | tools/habitat/src/providers/grit/diagnostics.ts<br>tools/habitat/src/providers/grit/docs-apply.ts<br>tools/habitat/src/providers/grit/failure.ts |
| relative | ../../../../../../_shared/mapgen-static-check-lib.mjs | 8 | 16 | .habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs<br>.habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/preserve_decomposed_foundation_contract_surfaces/preserve_decomposed_foundation_contract_surfaces.check.mjs<br>.habitat/civ7/mapgen/domain/blueprints/morphology-domain/contract/check/preserve_morphology_contracts_and_overlay_ownership/preserve_morphology_contracts_and_overlay_ownership.check.mjs |
| relative | ./ | 8 | 8 | .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.pattern.md<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops/prohibit_root_config_facade_imports_in_domain_ops.pattern.md |
| relative | ./request.js | 7 | 14 | tools/habitat/src/providers/grit/index.ts<br>tools/habitat/src/providers/grit/runner.ts<br>tools/habitat/src/resources/command/index.ts |
| habitat-toolkit | @habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy | 7 | 7 | tools/habitat/src/providers/grit/diagnostics.ts<br>tools/habitat/src/providers/grit/failure.ts<br>tools/habitat/src/providers/grit/resource.ts |
| mod | mods/mod-swooper-maps | 7 | 7 | .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.check.mjs<br>.habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.check.ts<br>.habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces.check.ts |
| workspace-tool | tsc --noEmit | 7 | 7 | apps/mapgen-studio/project.json#targets.check<br>mods/mod-civ7-intelligence-bridge/package.json#scripts.check<br>mods/mod-swooper-maps/project.json#targets.check |
| relative | ./context.policy.js | 6 | 12 | tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/file-layer-execution.policy.ts |
| relative | ./shared.schema.js | 6 | 12 | tools/habitat/src/service/modules/fix/model/dto/index.ts<br>tools/habitat/src/service/modules/fix/model/dto/pattern-apply-record.schema.ts<br>tools/habitat/src/service/modules/fix/model/dto/pattern-apply-request.schema.ts |
| workspace-tool | node | 6 | 11 | .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.rule.json<br>.habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current/verify_studio_recipe_artifacts_are_current.rule.json<br>.habitat/civ7/mapgen/studio/blueprints/worker-bundle/execution/check/ensure_studio_worker_bundle_is_browser_safe/ensure_studio_worker_bundle_is_browser_safe.rule.json |

## Direct Package Or Root Scripts Calling `.habitat` Internals

| package | script | command |
| --- | --- | --- |
| package.json | docs:project | ./.habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.generate.sh && bunx docsify-cli serve ./docs --port 7979 |
| tools/habitat/package.json | generate:schemas | bun run ../../.habitat/habitat/toolkit/blueprints/generator/contract/triage/preserve_generator_schema_contracts/write-preserve_generator_schema_contracts.ts |

## `.rule.mjs` Files Importing Transitional Habitat Runtime

| path |
| --- |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.mjs |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_adapter_context_imports_from_domain_ops/block_adapter_context_imports_from_domain_ops.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/boundary/check/block_engine_runtime_imports_from_domain_ops/block_engine_runtime_imports_from_domain_ops.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops/prohibit_root_config_facade_imports_in_domain_ops.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops/prohibit_runtime_orchestration_helpers_in_domain_ops.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_recipe_imports_in_domain_source/prohibit_recipe_imports_in_domain_source.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/prohibit_relative_domain_reaches_from_recipes_and_maps/prohibit_relative_domain_reaches_from_recipes_and_maps.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_domain_contract_roots_in_step_contracts/require_domain_contract_roots_in_step_contracts.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/restrict_recipes_to_public_domain_surfaces/restrict_recipes_to_public_domain_surfaces.rule.mjs |
| .habitat/civ7/mapgen/domain/blueprints/ecology-domain/boundary/check/require_public_ecology_surfaces_and_retired_topology_removal/require_public_ecology_surfaces_and_retired_topology_removal.rule.mjs |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/prohibit_domain_ops_projection_effect_dependencies/prohibit_domain_ops_projection_effect_dependencies.rule.mjs |
| .habitat/civ7/mapgen/map-output/blueprints/placement-outcome/boundary/check/require_typed_placement_outcomes_before_apply/require_typed_placement_outcomes_before_apply.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation/prohibit_ambient_rng_in_authored_generation.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_wrapper_only_advanced_config/prohibit_wrapper_only_advanced_config.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/prohibit_sibling_stage_private_step_imports/prohibit_sibling_stage_private_step_imports.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/boundary/check/require_shared_visualization_contracts_at_stage_surfaces/require_shared_visualization_contracts_at_stage_surfaces.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_bare_value_export_all_from_contract_surfaces/prohibit_bare_value_export_all_from_contract_surfaces.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/prohibit_empty_object_defaults_in_contract_schemas/prohibit_empty_object_defaults_in_contract_schemas.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/require_typed_dependency_and_effect_tag_constants/require_typed_dependency_and_effect_tag_constants.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_calls_to_runvalidated/prohibit_runtime_calls_to_runvalidated.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_local_config_default_merging/prohibit_runtime_local_config_default_merging.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/prohibit_runtime_validation_and_compiler_imports/prohibit_runtime_validation_and_compiler_imports.rule.mjs |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/execution/check/require_runtime_domain_op_bundle_imports/require_runtime_domain_op_bundle_imports.rule.mjs |
| .habitat/civ7/mapgen/sdk/blueprints/mapgen-entrypoint/execution/check/require_explicit_mapgen_sdk_opt_in/require_explicit_mapgen_sdk_opt_in.rule.mjs |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/boundary/check/require_studio_ui_recipe_artifact_imports/require_studio_ui_recipe_artifact_imports.rule.mjs |
| .habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/enforce_adapter_only_base_standard_imports/enforce_adapter_only_base_standard_imports.rule.mjs |
| .habitat/civ7/platform/blueprints/control-orpc/boundary/check/preserve_transport_pure_orpc_contracts/preserve_transport_pure_orpc_contracts.rule.mjs |
| .habitat/civ7/platform/blueprints/direct-control-session/boundary/check/require_sanctioned_direct_control_session_owners/require_sanctioned_direct_control_session_owners.rule.mjs |

## Checks Invoking Or Recommending Package Build/Currentness Commands

| path | kind | command or tie |
| --- | --- | --- |
| .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh | check-script |  |
| .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.check.ts | check-script | git; node:child_process; node:crypto; node:fs; node:path; node:url |
| .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.rule.json | rule-json | .habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.check.ts; bun |
| .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/require_projection_calls_in_projection_steps/require_projection_calls_in_projection_steps.check.mjs | check-script | node:path |
| .habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/artifact/check/verify_standard_recipe_artifacts_match_source_stages/verify_standard_recipe_artifacts_match_source_stages.check.ts | check-script | git; node:child_process; node:fs; node:path; node:url |
| .habitat/civ7/mapgen/studio/blueprints/dev-runner/structure/check/enforce_studio_dev_runner_topology/enforce_studio_dev_runner_topology.check.ts | check-script | bun --watch; bun src/server/daemon/daemon.ts; git; node:child_process; node:fs; node:path; node:url |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current/verify_studio_recipe_artifacts_are_current.check.mjs | check-script | git; node:child_process; node:fs; node:path |
| .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current/verify_studio_recipe_artifacts_are_current.rule.json | rule-json | .habitat/civ7/mapgen/studio/blueprints/recipe-artifact-supply/artifact/check/verify_studio_recipe_artifacts_are_current/verify_studio_recipe_artifacts_are_current.check.mjs; node |
| .habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/verify_visualization_runtime_build_artifacts/verify_visualization_runtime_build_artifacts.check.mjs | check-script | git; node:child_process; node:fs; node:path |
| .habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/verify_visualization_runtime_build_artifacts/verify_visualization_runtime_build_artifacts.rule.json | rule-json | .habitat/civ7/mapgen/visualization/blueprints/runtime-dependencies/artifact/check/verify_visualization_runtime_build_artifacts/verify_visualization_runtime_build_artifacts.check.mjs; node |
| .habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/block_unapproved_base_standard_boundary_leaks/block_unapproved_base_standard_boundary_leaks.check.sh | check-script |  |

## Unknown Or Unclassified Surfaces Requiring Follow-Up

| path | kind | sample ties |
| --- | --- | --- |
| .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.apply.pattern.md | apply-pattern | >; mods/; mods/mod-swooper-maps/src/domain/hydrology/ops/demo/strategies/default.ts |
| .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_recipes_and_maps/require_public_domain_surfaces_in_recipes_and_maps.apply.pattern.md | apply-pattern | >; mods/; mods/mod-swooper-maps/src/recipes/standard/stages/demo.ts |
| .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.fix.mjs | fix-script | node:fs/promises; node:path; --write |
| .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.operation.md | operation-note | --write; > |
| .habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.operation.md | operation-note | generate |
| .habitat/habitat/toolkit/blueprints/service-module/structure/check/enforce_habitat_orpc_service_wiring_shape/enforce_habitat_orpc_service_wiring_shape.pattern.md | pattern | >; ../../impl.js; ../module.js |

## Stale Detect Targets

_None._

## Raw Data

Complete records are committed in `execution-surface-map.json`.
