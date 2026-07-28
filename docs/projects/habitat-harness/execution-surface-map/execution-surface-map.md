# Execution Surface Map

Deterministic analytics for the Habitat authority execution surface. This report maps what can be executed, who invokes it, and what it reaches into. `rule.json` is treated as runner metadata, not policy authority.

## Sanity Assertions

- Passed: 108 `rule.json`, 21 `structure.toml`, and `tools/habitat` `generate:schemas` were detected.

## Surfaces By Kind

| kind | count |
| --- | --- |
| pattern | 68 |
| rule-json | 108 |
| structure-spec | 21 |
| check-script | 16 |
| apply-pattern | 1 |
| generate-script | 2 |
| operation-note | 3 |
| fix-script | 1 |
| package-script | 197 |
| nx-target | 129 |
| nx-plugin | 2 |
| nx-target-default | 11 |
| habitat-cli-source | 119 |

## Surfaces By Role

| role | count |
| --- | --- |
| policy_pattern | 69 |
| runner_metadata | 108 |
| structure_authority | 21 |
| command_check_executor | 16 |
| operation_surface | 6 |
| workspace_entrypoint | 339 |
| toolkit_runner | 119 |

## Execution Anatomy Roles

| anatomy role | surface count |
| --- | --- |
| policy-predicate | 90 |
| adapter | 108 |
| transient-dependency | 145 |
| fixture-support | 3 |
| entrypoint | 341 |
| runner-runtime | 119 |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 54 |
| .habitat/_support/execution/README.md | README | 0 | 18 |

## Entrypoints By Invoker

| invoker | count |
| --- | --- |
| unknown | 218 |
| direct-script | 5 |
| package | 198 |
| nx | 142 |
| habitat | 119 |

## Buckets

| bucket | count |
| --- | --- |
| unknown_invocation | 218 |
| mutation_surface | 138 |
| nx_ordering_tie | 152 |
| package_boundary_tie | 40 |
| direct_script_invoked | 5 |
| package_invoked | 340 |
| habitat_invoked | 119 |

## Top Cross-Boundary Ties By Fanout

| target class | target | source count | references | sample sources |
| --- | --- | --- | --- | --- |
| workspace-tool | nx:noop | 38 | 38 | apps/docs/project.json#targets.check<br>apps/mapgen-studio/project.json#targets.check<br>apps/mods/map/swooper-physics/project.json#targets.check |
| workspace-tool | tsc -p test/tsconfig.json --noEmit | 24 | 24 | apps/docs/package.json#scripts.check:test<br>apps/mods/map/swooper-physics/package.json#scripts.check:test<br>apps/mods/map/swooper-physics/project.json#targets.check:test |
| habitat-toolkit | @habitat/cli/service/model/check/index | 22 | 22 | tools/habitat/src/cli/commands/check.ts<br>tools/habitat/src/cli/commands/verify.ts<br>tools/habitat/src/service/model/check/policy/structural/blueprint-continuity-execution.policy.ts |
| habitat-toolkit | @habitat/cli/resources/command/index | 21 | 21 | tools/habitat/src/providers/biome/index.ts<br>tools/habitat/src/providers/git/index.ts<br>tools/habitat/src/providers/graphite/index.ts |
| relative | ./ | 19 | 19 | .habitat/blueprints/artifact/require_artifact_catalog_index_shape/pattern.md<br>.habitat/blueprints/artifact/require_artifact_file_shape/pattern.md<br>.habitat/blueprints/domain-atom/require_domain_atom_owner_shape/pattern.md |
| habitat-toolkit | @habitat/cli/service/model/rules/index | 19 | 19 | tools/habitat/src/resources/rule-diagnostics/providers/grit/acquisition-roots/index.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-findings.ts |
| workspace-tool | git | 16 | 16 | .habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/check.ts<br>.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/check.ts<br>.habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/check.mjs |
| workspace-tool | grit<br>language js(typescript)<br><br>or { | 16 | 16 | .habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_domain_ops_recipe_dependencies/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/pattern.md |
| relative | ./types.js | 14 | 25 | .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md<br>.habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/pattern.md<br>tools/habitat/src/resources/command/fake.ts |
| workspace-tool | tsc -p tsconfig.json --noEmit --composite false --incremental false | 14 | 14 | apps/docs/package.json#scripts.typecheck<br>apps/playground/package.json#scripts.typecheck<br>packages/civ7-control-orpc/project.json#targets.typecheck |
| workspace-tool | tsc -p tsconfig.json --noEmit | 11 | 11 | mods/mod-swooper-civ-dacia/package.json#scripts.typecheck<br>packages/mapgen-diagnostics/package.json#scripts.typecheck<br>packages/mapgen-metrics/package.json#scripts.typecheck |
| relative | ./contract.js | 10 | 10 | .habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/pattern.md<br>.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/pattern.md<br>.habitat/blueprints/domain-operation/require_domain_operation_implementation_artifact_boundary/pattern.md |
| habitat-toolkit | @habitat/cli/service/model/diagnostics/index | 10 | 10 | tools/habitat/src/resources/rule-diagnostics/providers/grit/acquisition-roots/index.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/command.ts |
| relative | ./output.js | 9 | 18 | tools/habitat/src/resources/command/index.ts<br>tools/habitat/src/resources/command/runner.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts |
| workspace-tool | grit | 9 | 9 | tools/habitat/src/resources/rule-diagnostics/providers/grit/command.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-preview.ts<br>tools/habitat/src/service/model/check/policy/structural/execution.policy.ts |
| relative | ./context.policy.js | 8 | 16 | tools/habitat/src/service/model/check/policy/structural/blueprint-continuity-execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/diagnostic-execution.policy.ts |
| relative | ./request.js | 8 | 16 | tools/habitat/src/resources/command/index.ts<br>tools/habitat/src/resources/command/observation.ts<br>tools/habitat/src/resources/command/result.ts |
| habitat-toolkit | @habitat/cli/service/model/workspace/index | 8 | 8 | tools/habitat/src/providers/nx/graph.ts<br>tools/habitat/src/providers/nx/index.ts<br>tools/habitat/src/providers/nx/inventory.ts |
| workspace-tool | bun -e "void 0" | 8 | 8 | mods/mod-swooper-civ-dacia/project.json#targets.build:deploy<br>packages/cli/package.json#scripts.prepack<br>packages/cli/project.json#targets.build |
| workspace-tool | tsc --noEmit | 8 | 8 | apps/mapgen-studio/project.json#targets.typecheck<br>apps/mods/map/swooper-physics/package.json#scripts.typecheck<br>apps/mods/map/swooper-physics/project.json#targets.typecheck |
| workspace-tool | tsc -p tsconfig.tools.json --noEmit | 8 | 8 | apps/mapgen-studio/project.json#targets.check:tools<br>packages/civ7-control-orpc/package.json#scripts.check:tools<br>packages/civ7-direct-control/package.json#scripts.check:tools |
| relative | ./command.js | 7 | 14 | tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-preview.ts |
| workspace-tool | bun test | 7 | 7 | apps/mods/map/swooper-physics/package.json#scripts.test<br>apps/mods/map/swooper-physics/project.json#targets.test<br>mods/mod-civ7-intelligence-bridge/package.json#scripts.test |
| workspace-tool | nx | 7 | 7 | tools/habitat/src/providers/nx/index.ts<br>tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts<br>tools/habitat/src/service/model/rules/dto/registry.schema.ts |
| habitat-toolkit | @habitat/cli/cli/base/HabitatCommand | 6 | 6 | tools/habitat/src/cli/commands/check.ts<br>tools/habitat/src/cli/commands/classify.ts<br>tools/habitat/src/cli/commands/fix.ts |

## Direct Package Or Root Scripts Calling `.habitat` Internals

| package | script | command |
| --- | --- | --- |
| apps/mapgen-studio/package.json | lint:react-compiler | node ../../.habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/lint-react-compiler.mjs |
| tools/habitat/package.json | check:tools | tsc -p bin/tsconfig.json --noEmit && tsc -p scripts/tsconfig.json --noEmit && tsc -p ../../.habitat/tsconfig.json --noEmit |
| tools/habitat/package.json | generate:schemas | bun run ../../.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/generate.ts |

## Checks Invoking Or Recommending Package Build/Currentness Commands

| path | kind | command or tie |
| --- | --- | --- |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/check.ts | check-script | bun --conditions bun-source src/server/daemon/daemon.ts; bun --watch; git; node:child_process; node:fs; node:module; node:path |

## Unknown Or Unclassified Surfaces Requiring Follow-Up

| path | kind | sample ties |
| --- | --- | --- |
| .habitat/blueprints/artifact/require_artifact_catalog_index_shape/pattern.md | pattern | ./; ./forecast.artifact.js; ./precipitation.artifact.js |
| .habitat/blueprints/artifact/require_artifact_catalog_index_shape/rule.json | rule-json |  |
| .habitat/blueprints/artifact/require_artifact_file_shape/pattern.md | pattern | >; ../../../model/policy/strata-policy.js; ../model/atoms/plate.schema.js |
| .habitat/blueprints/artifact/require_artifact_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/rule.json | rule-json |  |
| .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/structure.toml | structure-spec |  |
| .habitat/blueprints/cli-shell/require_cli_shell_project_topology/rule.json | rule-json |  |
| .habitat/blueprints/cli-shell/require_cli_shell_project_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/cli-topic-plugin/require_cli_topic_plugin_project_topology/rule.json | rule-json |  |
| .habitat/blueprints/cli-topic-plugin/require_cli_topic_plugin_project_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain-atom/require_domain_atom_owner_shape/pattern.md | pattern | >; ./; grit<br>language js(typescript)<br><br>predicate disallowed_root_atom_dependency($source) {<br>  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/schema\|type-fest\|\./[^\"']+)[\"']?$"<br>}<br><br>predicate disallowed_module_atom_dependency($source) {<br>  ! $source <: r"^[\"']?(?:@swooper/mapgen-core/authoring/schema\|type-fest\|\./[^\"']+\|(?:\.\./){4}model/atoms/(?:index\|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)[\"']?$"<br>}<br><br>or {<br>  import_statement(source=$source) where {<br>    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/model/atoms/[^/]+\.ts$",<br>    disallowed_root_atom_dependency($source)<br>  },<br>  import_statement(source=$source) where {<br>    $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/model/atoms/[^/]+\.ts$",<br>    disallowed_module_atom_dependency($source)<br>  },<br>  or { |
| .habitat/blueprints/domain-atom/require_domain_atom_owner_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-atom/require_domain_atom_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain-atom/require_domain_atom_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain-operation-strategy/require_domain_operation_strategy_import_boundaries/pattern.md | pattern | >; rm; ../../../../../../../hydrology/modules/hydrography/model/policy/river-class.js |
| .habitat/blueprints/domain-operation-strategy/require_domain_operation_strategy_import_boundaries/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation-strategy/require_domain_operation_strategy_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation-strategy/require_domain_operation_strategy_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/pattern.md | pattern | grit<br>language js(typescript)<br><br>or { |
| .habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/block_engine_runtime_imports_from_domain_ops/pattern.md | pattern | distribute-deposits/index.ts; grit<br>language js(typescript)<br><br>import_statement(source=$source) as $import where {<br>  $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.*\.ts$",<br>  $source <: r".*(?:@swooper/mapgen-core/engine\|@mapgen/engine)[\"']?$",<br>  ! $import <: includes "import type",<br>  ! $import <: includes "import { type",<br>  ! $import <: includes "import {type"<br>} |
| .habitat/blueprints/domain-operation/block_engine_runtime_imports_from_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/pattern.md | pattern | ../../lib/tectonics/shared.js; ../compute-mesh/index.js; ../index.js |
| .habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_domain_ops_recipe_dependencies/pattern.md | pattern | grit<br>language js(typescript)<br><br>or { |
| .habitat/blueprints/domain-operation/prohibit_domain_ops_recipe_dependencies/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops/pattern.md | pattern | grit<br>language js(typescript)<br><br>or {<br>  contains "RngFunction",<br>  contains "options.rng",<br>  contains r"\bctx\.rng\b"<br>} where {<br>  $filename <: r".*plugins/mod/map/[^/]+/src/domain/[^/]+/modules/[^/]+/ops/.+\.ts$"<br>} |
| .habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops/pattern.md | pattern | ../../../../../../config.js; ../../../../../config.js; ../../../../config.js |
| .habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/pattern.md | pattern | >; grit<br>language js(typescript)<br><br>or { |
| .habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/pattern.md | pattern | >; >>; rm |
| .habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_implementation_artifact_boundary/pattern.md | pattern | >; rm; ../../../../artifacts/rain.artifact.js |
| .habitat/blueprints/domain-operation/require_domain_operation_implementation_artifact_boundary/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_implementation_type_boundary/pattern.md | pattern | >; ../../../model/atoms/grid-bounds.schema.js; ../../contract.js |
| .habitat/blueprints/domain-operation/require_domain_operation_implementation_type_boundary/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_rule_import_boundaries/pattern.md | pattern | >; ../../../../../../recipes/standard/recipe.js; ../../../../../model/policy/world-policy.js |
| .habitat/blueprints/domain-operation/require_domain_operation_rule_import_boundaries/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain-policy/require_domain_policy_owner_shape/pattern.md | pattern | >; ../atoms/index.js; ../atoms/resource-family.schema.js |
| .habitat/blueprints/domain-policy/require_domain_policy_owner_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-policy/require_domain_policy_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain-policy/require_domain_policy_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain-subdomain/require_domain_module_contract_aggregate_shape/pattern.md | pattern | ./ops/; ./ops/compute-motion/contract.js; grit<br>language js(typescript)<br><br>or {<br>  program(statements=$body) where {<br>    ! $body <: contains |
| .habitat/blueprints/domain-subdomain/require_domain_module_contract_aggregate_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-subdomain/require_domain_module_entrypoint_shape/pattern.md | pattern | ./; ./artifacts/index.js; ./contract.js |
| .habitat/blueprints/domain-subdomain/require_domain_module_entrypoint_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-subdomain/require_domain_module_router_binding_shape/pattern.md | pattern | ./contract.js; ./ops/; ./ops/compute-motion/index.js |
| .habitat/blueprints/domain-subdomain/require_domain_module_router_binding_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-subdomain/require_domain_subdomain_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain-subdomain/require_domain_subdomain_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/prohibit_domain_artifacts_modules/rule.json | rule-json |  |
| .habitat/blueprints/domain/prohibit_domain_artifacts_modules/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/prohibit_recipe_imports_in_domain_source/pattern.md | pattern | ../../../../../../recipes/example/recipe.js; ../../../recipes/example/recipe.js; ./ |
| .habitat/blueprints/domain/prohibit_recipe_imports_in_domain_source/rule.json | rule-json |  |
| .habitat/blueprints/domain/prohibit_unknown_bag_config_usage/pattern.md | pattern | >; grit<br>language js(typescript)<br><br>or { |
| .habitat/blueprints/domain/prohibit_unknown_bag_config_usage/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_contract_aggregate_shape/pattern.md | pattern | rm; ./modules/; ./modules/tectonics/contract.js |
| .habitat/blueprints/domain/require_domain_contract_aggregate_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_entrypoint_shape/pattern.md | pattern | build; rm; ./ |
| .habitat/blueprints/domain/require_domain_entrypoint_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_model_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_model_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/require_domain_router_aggregate_shape/pattern.md | pattern | ./climate/router.js; ./contract.js; ./modules/ |
| .habitat/blueprints/domain/require_domain_router_aggregate_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/require_domain_test_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_test_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/pattern.md | pattern | ../../../../../domain/geology/modules/tectonics/ops/compute-plates/rules/private.js; ../../../../domain/geology/index.js; ../../../../domain/geology/model/policy/crust.js |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_tests/pattern.md | pattern | ../../../plugins/mod/map/example-mod/src/domain/geology/modules/lithosphere/ops/compute-crust/index.js; ../../../src/domain/geology/index.js; ../../../src/domain/geology/model/policy/crust.js |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_tests/rule.json | rule-json |  |
| .habitat/blueprints/map-config-catalog/require_map_config_catalog_file_shape/pattern.md | pattern | ../configs/canonical.js; ./admission.js; ./configs/canonical |
| .habitat/blueprints/map-config-catalog/require_map_config_catalog_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/map-config-catalog/require_map_config_catalog_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/map-config-catalog/require_map_config_catalog_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/map-mod-project/require_map_mod_project_root_topology/rule.json | rule-json |  |
| .habitat/blueprints/map-mod-project/require_map_mod_project_root_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/prohibit_sibling_stage_private_step_imports/pattern.md | pattern | >; ../../../../family/terrain/steps/deep/step.js; ../../../terrain/steps/shape-surface/step.js |
| .habitat/blueprints/recipe-stage/prohibit_sibling_stage_private_step_imports/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/pattern.md | pattern | >; ./evidence.js; ./public.config.js |
| .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/require_recipe_stage_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/require_recipe_stage_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/recipe-step/require_recipe_step_config_owner_shape/pattern.md | pattern | ./input.js; grit<br>language js(typescript)<br><br>or {<br>  program(statements=$body) where {<br>    or {<br>      ! $body <: contains |
| .habitat/blueprints/recipe-step/require_recipe_step_config_owner_shape/rule.json | rule-json |  |
| .habitat/blueprints/recipe-step/require_recipe_step_runtime_owner_shape/pattern.md | pattern | >; rm; ./config.js |
| .habitat/blueprints/recipe-step/require_recipe_step_runtime_owner_shape/rule.json | rule-json |  |
| .habitat/blueprints/recipe-step/require_recipe_step_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/recipe-step/require_recipe_step_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/recipe-step/require_typed_recipe_step_dependencies/pattern.md | pattern | ../../../../../completions.js; grit<br>language js(typescript)<br><br>or { |
| .habitat/blueprints/recipe-step/require_typed_recipe_step_dependencies/rule.json | rule-json |  |
| .habitat/blueprints/recipe/require_recipe_metrics_study_structure/rule.json | rule-json |  |
| .habitat/blueprints/recipe/require_recipe_metrics_study_structure/structure.toml | structure-spec |  |
| .habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/pattern.md | pattern | ../../domain/morphology/index.js; ../../domain/morphology/router.js; ../@mapgen/domain/placement |
| .habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md | pattern | build; ../contract.js; ./builders |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_empty_object_defaults_in_contract_schemas/pattern.md | pattern | packages/mapgen-core/src/demo.contract.ts; grit<br>language js(typescript) |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_empty_object_defaults_in_contract_schemas/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/check.mjs | check-script | ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; build |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/support.pattern.md | pattern | generate; grit<br>language js(typescript)<br><br>or {<br>  contains r"\.\s*getRandomNumber\s*\(" where {<br>    $filename <: r".*plugins/mod/map/swooper-physics/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(" where {<br>    $filename <: r".*plugins/mod/map/swooper-physics/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\bMath\s*\.\s*random\s*\(" where {<br>    $filename <: r".*plugins/mod/map/swooper-physics/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\.\s*(?:generateLakes\|designateBiomes\|addFeatures\|generateSnow\|generateResources\|generateOfficialResources\|generateDiscoveries\|generateOfficialDiscoveries\|assignStartPositions\|chooseStartSectors)\s*\(" where {<br>    $filename <: r".*plugins/mod/map/swooper-physics/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  import_statement(source=$source) where {<br>    $filename <: r".*plugins/mod/map/swooper-physics/src/(?:domain\|recipes/standard)/.*\.ts$",<br>    $source <: r"^[\"']?@swooper/mapgen-core/lib/rng[\"']?$"<br>  }<br>} |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_calls_to_runvalidated/pattern.md | pattern | >; packages/mapgen-core/src/authoring/op/create-op.ts; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_calls_to_runvalidated/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_local_config_default_merging/pattern.md | pattern | apps/not-a-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/step.ts; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_local_config_default_merging/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_validation_and_compiler_imports/pattern.md | pattern | rm; packages/mapgen-core/src/engine/value.ts; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_validation_and_compiler_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prefer_civ7_preset_dimensions_in_mapgen_behavior_tests/pattern.md | pattern | grit<br>language js(typescript)<br><br>predicate numeric_literal($value) {<br>  $value <: r"^-?(?:[0-9][0-9_]*(?:\.[0-9_]+)?\|\.[0-9_]+)$"<br>}<br><br>or { |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prefer_civ7_preset_dimensions_in_mapgen_behavior_tests/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_direct_standard_recipe_test_execution/pattern.md | pattern | >; ../../../../src/recipes/standard/recipe.js; ../../../src/recipes/standard/recipe.js |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_direct_standard_recipe_test_execution/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:path |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/preserve_morphology_belt_driver_contracts/pattern.md | pattern | grit<br>language js(typescript)<br><br>or {<br>  program(statements=$body) where {<br>    $filename <: r".*plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/coasts/steps/landmass-plates/config\.ts$",<br>    ! $body <: contains |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/preserve_morphology_belt_driver_contracts/rule.json | rule-json |  |
| .habitat/civ7/mapgen/rules/require_mapgen_exported_value_declarations_have_jsdoc/pattern.md | pattern | generate; ./model/policy/climate.js; ./model/types.js |
| .habitat/civ7/mapgen/rules/require_mapgen_exported_value_declarations_have_jsdoc/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/pattern.md | pattern | build; packages/mapgen-core/src/.; packages/mapgen-core/src/core/adapter-default.ts |
| .habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md | apply-pattern | >; packages/mapgen-core/src/lib/heightfield/base.ts; grit<br>language js(typescript)<br><br>or {<br>  program($statements) where {<br>    $filename <: r".*plugins/mod/map/[^/]+/src/(?:recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/.*\|domain/.*/ops/.*/strategies/.*)\.ts$",<br>    not { $filename <: r".*/config\.ts$" },<br>    not { $filename <: r".*\.(?:test\|spec)\.ts$" },<br>    not { $filename <: r".*/(?:__tests__\|tests?)/.*\.ts$" },<br>    $statements <: some $helper where {<br>      $helper <: |
| .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/pattern.md | pattern | >; rm; packages/mapgen-core/src/runtime/helpers.ts |
| .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/core/rules/require_mapgen_authoring_source_topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/core/rules/require_mapgen_authoring_source_topology/structure.toml | structure-spec |  |
| .habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/check.mjs | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/pattern.md | pattern | build; ../standard/contract-manifest.js; apps/mapgen-studio/src/server/recipeDag/service |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports/pattern.md | pattern | ../@swooper/swooper-physics/standard; apps/mapgen-studio/src/.; apps/mapgen-studio/src/App.js |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary/pattern.md | pattern | build; ./attributionReport; apps/mapgen-studio/src/server |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-cancel-command-owner/pattern.md | pattern | >; packages/studio-contract/src/index; packages/studio-contract/src/index.ts |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-cancel-command-owner/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-copy-deploy-boundary/pattern.md | pattern | >; generate; apps/mapgen-studio/src/server/studio/engines |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-copy-deploy-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary/pattern.md | pattern | >; apps/mapgen-studio/src/server/daemon/daemon; apps/mapgen-studio/src/server/daemon/daemon.ts |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-generator-port-boundary/pattern.md | pattern | >; generate; apps/mapgen-studio/src/server/. |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-generator-port-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-operation-identity-owner/pattern.md | pattern | >; rename; rm |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-operation-identity-owner/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-public-contract-closed/pattern.md | pattern | >; packages/studio-contract/src/runInGame; packages/studio-contract/src/runInGame.ts |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-public-contract-closed/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-map-render-file-plan-boundary/pattern.md | pattern | build; generate; writeFile |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-map-render-file-plan-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-run-manifest-generator-boundary/pattern.md | pattern | build; generate; writeFile |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-run-manifest-generator-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-studio-run-workspace-topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-studio-run-workspace-topology/structure.toml | structure-spec |  |
| .habitat/civ7/mapgen/studio/runtime/rules/preserve_studio_event_driven_runtime_boundaries/pattern.md | pattern | >; build; apps/mapgen-studio/src/ |
| .habitat/civ7/mapgen/studio/runtime/rules/preserve_studio_event_driven_runtime_boundaries/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/server/rules/enforce_studio_rpc_eventhub_topology/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/server/rules/enforce_studio_rpc_eventhub_topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/server/rules/prohibit_studio_rpc_eventhub_lifecycle_leaks/pattern.md | pattern | apps/mapgen-studio/src/server/daemon/daemon; apps/mapgen-studio/src/server/daemon/daemon.ts; apps/mapgen-studio/src/server/studio/context |
| .habitat/civ7/mapgen/studio/server/rules/prohibit_studio_rpc_eventhub_lifecycle_leaks/rule.json | rule-json |  |
| .habitat/civ7/mod-sdk/rules/require_explicit_mapgen_sdk_opt_in/pattern.md | pattern | build; ./authoring/index.js; ./builders |
| .habitat/civ7/mod-sdk/rules/require_explicit_mapgen_sdk_opt_in/rule.json | rule-json |  |
| .habitat/civ7/platform/adapter/rules/enforce_adapter_only_base_standard_imports/pattern.md | pattern | apps/example/src/demo.ts; packages/.; packages/civ7-adapter/ |
| .habitat/civ7/platform/adapter/rules/enforce_adapter_only_base_standard_imports/rule.json | rule-json |  |
| .habitat/civ7/platform/adapter/rules/prohibit_adapter_local_legacy_generator_logic/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/platform/adapter/rules/prohibit_adapter_local_legacy_generator_logic/rule.json | rule-json |  |
| .habitat/civ7/platform/control-orpc/rules/preserve_transport_pure_orpc_contracts/pattern.md | pattern | ./bridge/controller-ingress; ./modules/; ./modules/demo |
| .habitat/civ7/platform/control-orpc/rules/preserve_transport_pure_orpc_contracts/rule.json | rule-json |  |
| .habitat/civ7/platform/direct-control/session/rules/require_sanctioned_direct_control_session_owners/pattern.md | pattern | apps; apps/mapgen-studio/src/features/liveRuntime/session.ts; apps/mapgen-studio/src/features/liveRuntime/session.tsx |
| .habitat/civ7/platform/direct-control/session/rules/require_sanctioned_direct_control_session_owners/rule.json | rule-json |  |
| .habitat/civ7/platform/game-ui-bridge/rules/require_narrow_game_ui_bridge_bootstrap/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/platform/game-ui-bridge/rules/require_narrow_game_ui_bridge_bootstrap/rule.json | rule-json |  |
| .habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/pattern.md | pattern | ./policy-grid.js; ./types.js; packages/civ7-map-policy/src/. |
| .habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/rule.json | rule-json |  |
| .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/operation.md | operation-note | generate |
| .habitat/docs/_blueprints/docs-site/require_docs_site_root_inputs/rule.json | rule-json |  |
| .habitat/docs/_blueprints/docs-site/require_docs_site_root_inputs/structure.toml | structure-spec |  |
| .habitat/docs/_blueprints/docs-site/validate_docs_site_config_inputs/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>    encoding: "utf8",<br>  }; node:child_process; node:fs |
| .habitat/docs/_blueprints/docs-site/validate_docs_site_config_inputs/rule.json | rule-json |  |
| .habitat/docs/_blueprints/docs-site/verify_docs_site_link_integrity/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>    encoding: "utf8",<br>  }; mintlifyBin ["broken-links"] {<br>      cwd: tmpRoot,<br>      stdio: "inherit",<br>      env: process.env,<br>    }; node:fs |
| .habitat/docs/_blueprints/docs-site/verify_docs_site_link_integrity/rule.json | rule-json |  |
| .habitat/docs/_blueprints/mapgen-canonical-docs/require_mapgen_doc_ground_truth_anchors_heading/pattern.md | pattern | >; grit<br>language markdown<br><br>function mapgen_ground_truth_anchor_status($body) js {<br>  const text = $body.text;<br>  if (/\(legacy router\)/i.test(text)) return "ok";<br>  return /^##\s+Ground truth anchors\s*$/im.test(text) ? "ok" : "missing";<br>}<br><br>file($name, $body) where {<br>  $filename <: r".*docs/system/libs/mapgen/.*\.md$",<br>  $status = mapgen_ground_truth_anchor_status($body),<br>  $status <: includes "missing"<br>} |
| .habitat/docs/_blueprints/mapgen-canonical-docs/require_mapgen_doc_ground_truth_anchors_heading/rule.json | rule-json |  |
| .habitat/docs/_blueprints/mapgen-canonical-docs/require_mapgen_doc_mini_toc_shape/pattern.md | pattern | >; grit<br>language markdown<br><br>function mapgen_mini_toc_status($body) js {<br>  const first = $body.text.split(/\r?\n/).find((line) => line.trim().length > 0);<br>  return first?.trim().startsWith("<toc>") ? "ok" : "missing";<br>}<br><br>file($name, $body) where {<br>  $filename <: r".*docs/system/libs/mapgen/.*\.md$",<br>  $status = mapgen_mini_toc_status($body),<br>  $status <: includes "missing"<br>} |
| .habitat/docs/_blueprints/mapgen-canonical-docs/require_mapgen_doc_mini_toc_shape/rule.json | rule-json |  |
| .habitat/docs/_blueprints/mapgen-canonical-docs/validate_mapgen_docs_anchors_and_references/check.sh | check-script | python3 docs/system/libs/mapgen/tools/validate-anchors-and-references.py |
| .habitat/docs/_blueprints/mapgen-canonical-docs/validate_mapgen_docs_anchors_and_references/rule.json | rule-json |  |
| .habitat/docs/rules/ensure_docs_checkout_paths_are_portable/check.mjs | check-script | node:fs; node:path; node:url |
| .habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json | rule-json |  |
| .habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/fix.mjs | fix-script | node:fs/promises; node:path; --write |
| .habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/operation.md | operation-note | --write; > |
| .habitat/global/workspace/rules/enforce_formatting_and_import_hygiene/rule.json | rule-json |  |
| .habitat/global/workspace/rules/enforce_workspace_import_boundaries/rule.json | rule-json |  |
| .habitat/global/workspace/rules/enforce_workspace_reachability_and_dependency_hygiene/rule.json | rule-json |  |
| .habitat/global/workspace/rules/prohibit_pnpm_files_in_bun_workspace/rule.json | rule-json |  |
| .habitat/global/workspace/rules/require_owner_workflow_for_host_protected_surfaces/rule.json | rule-json |  |
| .habitat/global/workspace/rules/validate_boundary_taxonomy_against_workspace_graph/check.sh | check-script | tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts; bun tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts |
| .habitat/global/workspace/rules/validate_boundary_taxonomy_against_workspace_graph/rule.json | rule-json |  |
| .habitat/habitat/toolkit/_blueprints/cli/verify_habitat_cli_smoke_contract/check.ts | check-script | command {<br>    cwd: repoRoot,<br>    env: { ...process.env, FORCE_COLOR: "0" },<br>    stderr: "pipe",<br>    stdout: "pipe",<br>  }; node:fs; node:path |
| .habitat/habitat/toolkit/_blueprints/cli/verify_habitat_cli_smoke_contract/rule.json | rule-json |  |
| .habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/operation.md | operation-note | bash<br>bun run --cwd tools/habitat generate:schemas; generate; .habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/scaffold-pattern.schema.json |
| .habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/pattern.md | pattern | .habitat/habitat/toolkit/_blueprints/service-module/example-rule/rule.json; apps/; apps/mapgen-studio |
| .habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/rule.json | rule-json |  |
| .habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md | pattern | ../resources/rule-diagnostics/providers/grit/index.js; ../resources/rule-diagnostics/providers/grit/provider.js; ../src/resources/rule-diagnostics/providers/grit/index.js |
| .habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json | rule-json |  |
| .habitat/habitat/toolkit/_blueprints/service-module/enforce_habitat_orpc_service_wiring_shape/pattern.md | pattern | >; ../../impl.js; ../module.js |
| .habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_file_shape/check.ts | check-script | node:fs; node:path; .habitat |
| .habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_file_shape/rule.json | rule-json |  |
| .habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_root_topology/rule.json | rule-json |  |
| .habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_root_topology/structure.toml | structure-spec |  |

## Stale Detect Targets

_None._

## Raw Data

Complete records are committed in `execution-surface-map.json`.
