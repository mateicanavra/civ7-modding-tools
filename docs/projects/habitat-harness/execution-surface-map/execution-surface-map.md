# Execution Surface Map

Deterministic analytics for the Habitat authority execution surface. This report maps what can be executed, who invokes it, and what it reaches into. `rule.json` is treated as runner metadata, not policy authority.

## Sanity Assertions

- Passed: 123 `rule.json`, 8 `structure.toml`, root `docs:project`, and `tools/habitat` `generate:schemas` were detected.

## Surfaces By Kind

| kind | count |
| --- | --- |
| check-script | 29 |
| rule-json | 123 |
| pattern | 82 |
| structure-spec | 8 |
| apply-pattern | 1 |
| generate-script | 2 |
| operation-note | 3 |
| fix-script | 1 |
| package-script | 162 |
| nx-target | 60 |
| nx-plugin | 1 |
| nx-target-default | 9 |
| habitat-cli-source | 111 |

## Surfaces By Role

| role | count |
| --- | --- |
| command_check_executor | 29 |
| runner_metadata | 123 |
| policy_pattern | 83 |
| structure_authority | 8 |
| operation_surface | 6 |
| workspace_entrypoint | 232 |
| toolkit_runner | 111 |

## Execution Anatomy Roles

| anatomy role | surface count |
| --- | --- |
| fixture-support | 9 |
| adapter | 123 |
| policy-predicate | 91 |
| transient-dependency | 106 |
| entrypoint | 234 |
| runner-runtime | 111 |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 161 |
| .habitat/_support/execution/README.md | README | 0 | 18 |

## Entrypoints By Invoker

| invoker | count |
| --- | --- |
| unknown | 247 |
| package | 164 |
| nx | 70 |
| direct-script | 3 |
| habitat | 111 |

## Buckets

| bucket | count |
| --- | --- |
| package_boundary_tie | 96 |
| unknown_invocation | 247 |
| mutation_surface | 126 |
| nx_ordering_tie | 113 |
| package_invoked | 234 |
| direct_script_invoked | 3 |
| habitat_invoked | 111 |

## Top Cross-Boundary Ties By Fanout

| target class | target | source count | references | sample sources |
| --- | --- | --- | --- | --- |
| workspace-tool | grit<br>language js(typescript)<br><br>or { | 28 | 28 | .habitat/blueprints/dependency-tag/require_typed_dependency_and_effect_tag_constants/pattern.md<br>.habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_domain_ops_projection_effect_dependencies/pattern.md |
| habitat-toolkit | @habitat/cli/resources/command/index | 21 | 21 | tools/habitat/src/providers/biome/index.ts<br>tools/habitat/src/providers/git/index.ts<br>tools/habitat/src/providers/graphite/index.ts |
| habitat-toolkit | @habitat/cli/service/model/check/index | 20 | 20 | tools/habitat/src/cli/commands/check.ts<br>tools/habitat/src/cli/commands/verify.ts<br>tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts |
| workspace-tool | tsc -p tsconfig.json --noEmit | 20 | 20 | apps/docs/package.json#scripts.check<br>apps/docs/package.json#scripts.check:ts<br>apps/playground/package.json#scripts.check |
| workspace-tool | git | 19 | 19 | .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/check.mjs<br>.habitat/blueprints/domain/require_public_domain_surfaces_in_tests/check.mjs<br>.habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/check.ts |
| habitat-toolkit | @habitat/cli/service/model/rules/index | 17 | 17 | tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/diagnostics.ts |
| relative | ./types.js | 14 | 25 | .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md<br>.habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/pattern.md<br>tools/habitat/src/resources/command/fake.ts |
| workspace-tool | node -e "" | 14 | 14 | apps/docs/project.json#targets.build<br>apps/mapgen-studio/project.json#targets.build<br>mods/mod-civ7-intelligence-bridge/project.json#targets.build |
| relative | ./ | 10 | 10 | .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/check.mjs<br>.habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops/pattern.md |
| habitat-toolkit | @habitat/cli/service/model/diagnostics/index | 10 | 10 | tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/command.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/failure.ts |
| habitat-toolkit | @habitat/cli/service/model/workspace/index | 10 | 10 | tools/habitat/src/providers/nx/graph.ts<br>tools/habitat/src/providers/nx/index.ts<br>tools/habitat/src/providers/nx/inventory.ts |
| workspace-tool | biome check . | 10 | 10 | mods/mod-swooper-civ-dacia/package.json#scripts.lint<br>mods/mod-swooper-maps/package.json#scripts.lint<br>package.json#scripts.biome:check |
| workspace-tool | grit | 10 | 10 | .habitat/civ7/mapgen/studio/run-in-game/rules/habitat-studio-run-runtime-authority-closure/check.mjs<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/command.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-planning.ts |
| habitat-toolkit | @habitat/cli/resources/config/index | 9 | 9 | tools/habitat/src/providers/biome/index.ts<br>tools/habitat/src/providers/git/index.ts<br>tools/habitat/src/providers/graphite/index.ts |
| mod | mods/ | 9 | 9 | .habitat/blueprints/recipe-step/require_domain_contract_roots_in_step_contracts/pattern.md<br>.habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/pattern.md<br>.habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md |
| relative | ./request.js | 8 | 16 | tools/habitat/src/resources/command/index.ts<br>tools/habitat/src/resources/command/observation.ts<br>tools/habitat/src/resources/command/result.ts |
| mod | mods/mod-swooper-maps/src/ | 8 | 8 | .habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/pattern.md<br>.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonics/pattern.md<br>.habitat/civ7/mapgen/domains/foundation/rules/prohibit_legacy_compute_tectonics_token/pattern.md |
| mod | mods/mod-swooper-maps/src/domain/ | 8 | 8 | .habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/pattern.md |
| mod | mods/mod-swooper-maps/src/recipes/standard/stages/ | 8 | 8 | .habitat/blueprints/recipe-stage/prohibit_sibling_stage_private_step_imports/pattern.md<br>.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/pattern.md<br>.habitat/blueprints/recipe-stage/require_shared_visualization_contracts_at_stage_surfaces/pattern.md |
| relative | ./output.js | 7 | 14 | tools/habitat/src/resources/command/index.ts<br>tools/habitat/src/resources/command/runner.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts |
| workspace-tool | grit<br>language js(typescript) | 7 | 7 | .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonics/pattern.md<br>.habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md<br>.habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_empty_object_defaults_in_contract_schemas/pattern.md |
| mod | mods/mod-swooper-maps/src/domain/. | 7 | 7 | .habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/pattern.md<br>.habitat/blueprints/domain-operation/block_engine_runtime_imports_from_domain_ops/pattern.md<br>.habitat/blueprints/domain-operation/prohibit_domain_ops_projection_effect_dependencies/pattern.md |
| workspace-tool | tsc --noEmit | 7 | 7 | apps/mapgen-studio/project.json#targets.check<br>mods/mod-civ7-intelligence-bridge/package.json#scripts.check<br>mods/mod-swooper-maps/project.json#targets.check |
| relative | ./command.js | 6 | 12 | tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts<br>tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts |
| relative | ./context.policy.js | 6 | 12 | tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/diagnostic-execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/execution.policy.ts |

## Direct Package Or Root Scripts Calling `.habitat` Internals

| package | script | command |
| --- | --- | --- |
| apps/mapgen-studio/package.json | lint:react-compiler | node ../../.habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/lint-react-compiler.mjs |
| package.json | docs:project | ./.habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/generate.sh && bunx docsify-cli serve ./docs --port 7979 |
| tools/habitat/package.json | generate:schemas | bun run ../../.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/generate.ts |

## Checks Invoking Or Recommending Package Build/Currentness Commands

| path | kind | command or tie |
| --- | --- | --- |
| .habitat/civ7/mapgen/domains/ecology/_remainder/validate_ecology_op_contract_quality/check.sh | check-script | bun run --cwd mods/mod-swooper-maps validate:ecology-op-contract-quality |
| .habitat/civ7/mapgen/sdk/visualization/rules/verify_visualization_runtime_build_artifacts/check.mjs | check-script | git; node:child_process; node:fs; node:path |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/check.ts | check-script | bun --conditions bun-source src/server/daemon/daemon.ts; bun --watch; git; node:child_process; node:fs; node:module; node:path |

## Unknown Or Unclassified Surfaces Requiring Follow-Up

| path | kind | sample ties |
| --- | --- | --- |
| .habitat/blueprints/artifact/prohibit_realized_map_artifact_tags/check.mjs | check-script | ../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; ../../../_support/execution/command-check/mapgen-static-check-lib.mjs |
| .habitat/blueprints/artifact/prohibit_realized_map_artifact_tags/rule.json | rule-json |  |
| .habitat/blueprints/artifact/require_artifact_file_shape/pattern.md | pattern | >; ./artifacts/start-assignment.artifact.js; mods/mod-swooper-maps/src/. |
| .habitat/blueprints/artifact/require_artifact_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/check.mjs | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/rule.json | rule-json |  |
| .habitat/blueprints/dependency-tag/require_typed_dependency_and_effect_tag_constants/pattern.md | pattern | ../../../../tags.js; ../../hydrology-hydrography/artifacts.js; mods/mod-swooper-maps/src/recipes/standard/stages/. |
| .habitat/blueprints/dependency-tag/require_typed_dependency_and_effect_tag_constants/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/pattern.md | pattern | mods/mod-swooper-maps/src/domain/.; mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts; mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts |
| .habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/block_engine_runtime_imports_from_domain_ops/pattern.md | pattern | mods/mod-swooper-maps/src/domain/.; mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts; mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts |
| .habitat/blueprints/domain-operation/block_engine_runtime_imports_from_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/pattern.md | pattern | ../../lib/tectonics/shared.js; ../compute-mesh/index.js; ../src/domain/foundation/ops/compute-mesh/index.js |
| .habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_domain_ops_projection_effect_dependencies/pattern.md | pattern | mods/mod-swooper-maps/src/domain/.; mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts; mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts |
| .habitat/blueprints/domain-operation/prohibit_domain_ops_projection_effect_dependencies/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops/pattern.md | pattern | mods/mod-swooper-maps/src/domain/; grit<br>language js(typescript)<br><br>or {<br>  contains "RngFunction",<br>  contains "options.rng",<br>  contains r"\bctx\.rng\b"<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops/.*\.ts$"<br>} |
| .habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops/pattern.md | pattern | ../../../../../../config.js; ../../../../../config.js; ../../../../config.js |
| .habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/pattern.md | pattern | >; mods/mod-swooper-maps/src/domain/; mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts |
| .habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/pattern.md | pattern | ../../artifacts/demo.artifact.js; ../../model/config.js; ../../model/policy/demo-policy.js |
| .habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain-operation/require_domain_ops_registry_surface/pattern.md | pattern | >; rm; ./ |
| .habitat/blueprints/domain-operation/require_domain_ops_registry_surface/rule.json | rule-json |  |
| .habitat/blueprints/domain/prohibit_domain_artifacts_modules/rule.json | rule-json |  |
| .habitat/blueprints/domain/prohibit_domain_artifacts_modules/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/prohibit_domain_entrypoint_self_reexports/pattern.md | pattern | >; mods/mod-swooper-maps/src/domain/; grit<br>language js(typescript)<br><br>or { |
| .habitat/blueprints/domain/prohibit_domain_entrypoint_self_reexports/rule.json | rule-json |  |
| .habitat/blueprints/domain/prohibit_recipe_imports_in_domain_source/pattern.md | pattern | ../../../../../recipes-extra/standard.js; ../../../../../recipes-extra/standard/recipe.js; ../../../../../recipes/standard/recipe.js |
| .habitat/blueprints/domain/prohibit_recipe_imports_in_domain_source/rule.json | rule-json |  |
| .habitat/blueprints/domain/prohibit_unknown_bag_config_usage/pattern.md | pattern | mods/mod-swooper-maps/src/domain/.; grit<br>language js(typescript)<br><br>or {<br>  contains "UnknownRecord",<br>  contains "INTERNAL_METADATA_KEY"<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/domain/.*\.ts$"<br>} |
| .habitat/blueprints/domain/prohibit_unknown_bag_config_usage/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/pattern.md | pattern | >; ../ops/compute-crust/contract.js; ./plate-activity.schema.js |
| .habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_ops_binding_surface/pattern.md | pattern | ./compute-mesh/index.js; ./index.js; ./model/policy/helper.js |
| .habitat/blueprints/domain/require_domain_ops_binding_surface/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_source_topology/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_domain_source_topology/structure.toml | structure-spec |  |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/pattern.md | pattern | ../../../../../domain/hydrology/index.js; ../../../../domain/hydrology/index.js; ./ |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json | rule-json |  |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_tests/check.mjs | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; source; node:child_process |
| .habitat/blueprints/domain/require_public_domain_surfaces_in_tests/rule.json | rule-json |  |
| .habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/rule.json | rule-json |  |
| .habitat/blueprints/mod-map/protect_generated_map_entrypoints_from_hand_edits/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/prohibit_sibling_stage_private_step_imports/pattern.md | pattern | ../../b/steps/foo/index.js; ../../b/steps/foo/types.js; ../b/steps/foo/contract.js |
| .habitat/blueprints/recipe-stage/prohibit_sibling_stage_private_step_imports/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/pattern.md | pattern | >; ../placement-public-config.js; ./ |
| .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json | rule-json |  |
| .habitat/blueprints/recipe-stage/require_shared_visualization_contracts_at_stage_surfaces/pattern.md | pattern | ../../hydrology/viz.js; ../mesh/viz.js; ../steps/viz.js |
| .habitat/blueprints/recipe-stage/require_shared_visualization_contracts_at_stage_surfaces/rule.json | rule-json |  |
| .habitat/blueprints/recipe-step/require_domain_contract_roots_in_step_contracts/pattern.md | pattern | build; generate; ../../@mapgen/domain/ecology/ops |
| .habitat/blueprints/recipe-step/require_domain_contract_roots_in_step_contracts/rule.json | rule-json |  |
| .habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/pattern.md | pattern | ../@mapgen/domain/placement; mods/; mods/mod-swooper-maps/src/maps/standard/recipe.ts |
| .habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/ecology/_remainder/validate_ecology_op_contract_quality/check.sh | check-script | bun run --cwd mods/mod-swooper-maps validate:ecology-op-contract-quality; mods/mod-swooper-maps; bun run --cwd mods/mod-swooper-maps validate:ecology-op-contract-quality |
| .habitat/civ7/mapgen/domains/ecology/_remainder/validate_ecology_op_contract_quality/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/ecology/rules/require_ecology_canonical_op_module_topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/ecology/rules/require_ecology_canonical_op_module_topology/structure.toml | structure-spec |  |
| .habitat/civ7/mapgen/domains/ecology/rules/require_public_ecology_surfaces_and_retired_topology_removal/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/; grit<br>language js(typescript)<br><br>or {<br>  import_statement(source=$source) where {<br>    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:ecology-biomes\|ecology-features\|ecology-pedology\|map-ecology)/.*\.ts$",<br>    $source <: r"^[\"']?@mapgen/domain/ecology/(?:ops\|rules)(?:$\|/).*"<br>  }, |
| .habitat/civ7/mapgen/domains/ecology/rules/require_public_ecology_surfaces_and_retired_topology_removal/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/preserve_decomposed_foundation_contract_surfaces/check.mjs | check-script | ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs |
| .habitat/civ7/mapgen/domains/foundation/rules/preserve_decomposed_foundation_contract_surfaces/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_decomposed_ops_legacy_internal_imports/pattern.md | pattern | mods/mod-swooper-maps/src/domain/foundation/ops/compute-; grit<br>language js(typescript)<br><br>or {<br>  import_statement(source=$source), |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_decomposed_ops_legacy_internal_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_duplicate_math_helper_redefinitions/pattern.md | pattern | rm; mods/mod-swooper-maps/src/domain/foundation/ops/; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_duplicate_math_helper_redefinitions/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonic_op_surface/pattern.md | pattern | mods/mod-swooper-maps/src/domain/foundation/ops/; grit<br>language js(typescript)<br><br>contains r"\bcomputeTectonicHistory\b\|compute-tectonic-history/(?:contract\|index)\.js" where {<br>  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/(?:contracts\|index)\.ts$"<br>} |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonic_op_surface/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonics/pattern.md | pattern | mods/mod-swooper-maps/src/; grit<br>language js(typescript) |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonics/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_plate_kinematics/pattern.md | pattern | mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract; grit<br>language js(typescript)<br><br>or {<br>  contains r"\bvelocityX\b",<br>  contains r"\bvelocityY\b",<br>  contains r"\brotation\b"<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/contract\.ts$"<br>} |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_plate_kinematics/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_op_contract_config_bags/pattern.md | pattern | mods/mod-swooper-maps/src/domain/foundation/ops/; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_op_contract_config_bags/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_rules_tectonics_shim_reexports/pattern.md | pattern | mods/mod-swooper-maps/src/domain/foundation/ops/compute-; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_rules_tectonics_shim_reexports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_strategy_nonlocal_imports/pattern.md | pattern | ./contract; ./rules/; mods/mod-swooper-maps/src/domain/foundation/ops/compute- |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_strategy_nonlocal_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_legacy_compute_tectonics_token/pattern.md | pattern | mods/mod-swooper-maps/src/; grit<br>language js(typescript)<br><br>contains r"\bcomputeTectonics\b" where {<br>  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/foundation\|recipes/standard/stages/foundation(?:-[^/]+)?\|maps)/.*\.(?:ts\|json)$"<br>} |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_legacy_compute_tectonics_token/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/hydrology/rules/prohibit_hydrology_climate_intervention_tokens/pattern.md | pattern | mods/mod-swooper-maps/src/; grit<br>language js(typescript)<br><br>or {<br>  contains "climate.swatches",<br>  contains "climate.story"<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology\|recipes/standard/stages/hydrology-(?:climate-baseline\|hydrography\|climate-refine))/.*\.ts$"<br>} |
| .habitat/civ7/mapgen/domains/hydrology/rules/prohibit_hydrology_climate_intervention_tokens/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/hydrology/rules/prohibit_hydrology_narrative_domain_imports/pattern.md | pattern | mods/mod-swooper-maps/src/; grit<br>language js(typescript)<br><br>import_statement(source=$source) where {<br>  $filename <: r".*mods/mod-swooper-maps/src/(?:domain/hydrology\|recipes/standard/stages/hydrology-(?:climate-baseline\|hydrography\|climate-refine))/.*\.ts$",<br>  $source <: r".*@mapgen/domain/narrative/.+"<br>} |
| .habitat/civ7/mapgen/domains/hydrology/rules/prohibit_hydrology_narrative_domain_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/morphology/rules/require_morphology_config_facade_exports/check.mjs | check-script | ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs |
| .habitat/civ7/mapgen/domains/morphology/rules/require_morphology_config_facade_exports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/domains/morphology/rules/require_morphology_public_surface_imports/pattern.md | pattern | build; mods/mod-swooper-maps/src/.; mods/mod-swooper-maps/src/domain/. |
| .habitat/civ7/mapgen/domains/morphology/rules/require_morphology_public_surface_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md | pattern | build; ../contract.js; ./builders |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_empty_object_defaults_in_contract_schemas/pattern.md | pattern | mods/; mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts; mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.tsx |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_empty_object_defaults_in_contract_schemas/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/check.mjs | check-script | ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; build |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/support.pattern.md | pattern | generate; mods/mod-swooper-maps/src/; grit<br>language js(typescript)<br><br>or {<br>  contains r"\.\s*getRandomNumber\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\bMath\s*\.\s*random\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\.\s*(?:generateLakes\|designateBiomes\|addFeatures\|generateSnow\|generateResources\|generateOfficialResources\|generateDiscoveries\|generateOfficialDiscoveries\|assignStartPositions\|chooseStartSectors)\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  import_statement(source=$source) where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$",<br>    $source <: r"^[\"']?@swooper/mapgen-core/lib/rng[\"']?$"<br>  }<br>} |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_calls_to_runvalidated/pattern.md | pattern | >; mods/; mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_calls_to_runvalidated/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_local_config_default_merging/pattern.md | pattern | mods/mod-swooper-maps/src/; mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/index.ts; mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/strategies/default.ts |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_local_config_default_merging/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_validation_and_compiler_imports/pattern.md | pattern | rm; mods/; mods/mod-swooper-maps/src/domain/ecology/ops/score-biomes/contract.ts |
| .habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_validation_and_compiler_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/check.mjs | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_map_projection_dependencies_in_physics_contracts/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/; mods/mod-swooper-maps/src/recipes/standard/stages/foundation-tectonics/steps/tectonics.contract.ts; mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_map_projection_dependencies_in_physics_contracts/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/experimental/tags.ts; mods/mod-swooper-maps/src/recipes/standard/.; mods/mod-swooper-maps/src/recipes/standard/stages/ecology/tags.ts |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_wrapper_only_advanced_config/pattern.md | pattern | generate; rm; generatedConfig |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_wrapper_only_advanced_config/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_map_effect_name_suffixes/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/other.ts; mods/mod-swooper-maps/src/recipes/standard/tag-contracts; mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_map_effect_name_suffixes/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_tag_catalog_owner_tokens/check.mjs | check-script | ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; ../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_tag_catalog_owner_tokens/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:path |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_projection_legacy_motion_source/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/projection; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_projection_legacy_motion_source/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_cast_merge_hacks/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/foundation-; grit<br>language js(typescript)<br><br>or {<br>  contains r"const (?:mantleOverrideValues\|budgetsOverrideValues\|meshOverrideValues) = \(advanced\?\.[^)]* \?\? \{\}\) as",<br>  contains r"typeof (?:mantleOverrideValues\|budgetsOverrideValues\|meshOverrideValues)\.", |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_cast_merge_hacks/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_sentinel_passthrough/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/foundation-; grit<br>language js(typescript)<br><br>or {<br>  contains "FOUNDATION_STUDIO_STEP_CONFIG_IDS",<br>  contains "FOUNDATION_STEP_IDS",<br>  contains r"\badvancedRecord\s*\[\s*stepId\s*\]",<br>  contains "__studioUiMetaSentinelPath"<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation-(?:lithosphere\|mantle\|orogeny\|projection\|tectonics)/index\.ts$"<br>} |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_sentinel_passthrough/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_step_contract_config_bags/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/foundation; grit<br>language js(typescript)<br><br>or { |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_step_contract_config_bags/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_migrated_consumer_effect_gating_tokens/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes; mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.contract.ts; mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/rivers.contract.ts |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_migrated_consumer_effect_gating_tokens/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_misplaced_projection_adapter_calls/pattern.md | pattern | build; generate; mods/mod-swooper-maps/src/recipes/standard/stages/ |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_misplaced_projection_adapter_calls/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/require_projection_calls_in_projection_steps/check.mjs | check-script | ../../../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; build |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/require_projection_calls_in_projection_steps/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/preserve_morphology_belt_driver_contracts/check.mjs | check-script | ../../../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs; node:path; ../../../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/preserve_morphology_belt_driver_contracts/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_overlay_implementation_reads/pattern.md | pattern | ./overlays; ./overlays.js; mods/mod-swooper-maps/src/recipes/standard/stages/morphology |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_overlay_implementation_reads/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_runtime_continent_step_tokens/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/; grit<br>language js(typescript)<br><br>or {<br>  contains r"\bwestContinent\b",<br>  contains r"\beastContinent\b",<br>  contains r"\bLandmassRegionId\b",<br>  contains r"\bmarkLandmassId\s*\("<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts\|morphology-routing\|morphology-erosion\|morphology-features)/.*\.ts$"<br>} |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_runtime_continent_step_tokens/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_config_bag_imports/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/demo.ts; mods/mod-swooper-maps/src/recipes/standard/stages/morphology; mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/demo.ts |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_config_bag_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_legacy_effect_gates/pattern.md | pattern | mods/mod-swooper-maps/src/recipes/standard/stages/; grit<br>language js(typescript)<br><br>contains r"(?:landmassApplied\|coastlinesApplied\|effect:engine\.landmassApplied\|effect:engine\.coastlinesApplied)" where {<br>  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts\|morphology-routing\|morphology-erosion\|morphology-features)/.*\.ts$"<br>} |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_legacy_effect_gates/rule.json | rule-json |  |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/placement/rules/require_typed_placement_outcomes_before_apply/pattern.md | pattern | generate; mods/mod-swooper-maps/mod/src/recipes/standard/stages/placement/steps/placement/apply.ts; mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-resources/apply.ts |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/placement/rules/require_typed_placement_outcomes_before_apply/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/pattern.md | pattern | build; packages/mapgen-core/src/.; packages/mapgen-core/src/adapter/demo.ts |
| .habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md | apply-pattern | >; mods/; mods/mod-swooper-maps/src/domain/hydrology/ops/demo/strategies/default.ts |
| .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/pattern.md | pattern | >; rm; mods/ |
| .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json | rule-json |  |
| .habitat/civ7/mapgen/sdk/visualization/rules/verify_visualization_runtime_build_artifacts/check.mjs | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; Run `bun run --cwd mods/mod-swooper-maps viz:runtime-deps` to build the package-local runtime deps.; node:child_process |
| .habitat/civ7/mapgen/sdk/visualization/rules/verify_visualization_runtime_build_artifacts/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/check.mjs | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/pattern.md | pattern | build; ../standard/contract-manifest.js; apps/mapgen-studio/src/server/recipeDag/service |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports/pattern.md | pattern | ../mod-swooper-maps/recipes/standard; apps/mapgen-studio/src/.; apps/mapgen-studio/src/App.js |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary/pattern.md | pattern | build; ./attributionReport; apps/mapgen-studio/src/server |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-cancel-command-owner/pattern.md | pattern | >; packages/studio-contract/src/index; packages/studio-contract/src/index.ts |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-cancel-command-owner/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-copy-deploy-boundary/pattern.md | pattern | >; generate; apps/mapgen-studio/src/server/studio/engines |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-copy-deploy-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary/pattern.md | pattern | >; apps/mapgen-studio/src/server/runInGame/runtimeObservation; apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-generator-port-boundary/pattern.md | pattern | >; generate; apps/mapgen-studio/src/server/. |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-generator-port-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-launch-source-boundary/pattern.md | pattern | apps/mapgen-studio/src/app/hooks/useRunInGame; apps/mapgen-studio/src/app/hooks/useRunInGame.ts; packages/studio-contract/src/runInGame |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-launch-source-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-operation-identity-owner/pattern.md | pattern | >; rename; rm |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-operation-identity-owner/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-public-contract-closed/pattern.md | pattern | >; packages/studio-contract/src/runInGame; packages/studio-contract/src/runInGame.ts |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-public-contract-closed/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-map-render-file-plan-boundary/pattern.md | pattern | >; build; generate |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-map-render-file-plan-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-run-manifest-generator-boundary/pattern.md | pattern | build; generate; writeFile |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-run-manifest-generator-boundary/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/habitat-studio-run-runtime-authority-closure/check.mjs | check-script | "bun" args {<br>    cwd: repoRoot,<br>    encoding: "utf8",<br>    env: { ...process.env, HABITAT_STUDIO_RUN_AUTHORITY_CLOSURE_CHILD: "1" },<br>    maxBuffer: 20 * 1024 * 1024,<br>  }; node:child_process; node:fs |
| .habitat/civ7/mapgen/studio/run-in-game/rules/habitat-studio-run-runtime-authority-closure/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-studio-run-workspace-topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-studio-run-workspace-topology/structure.toml | structure-spec |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-swooper-catalog-index-target-topology/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-swooper-catalog-index-target-topology/structure.toml | structure-spec |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-swooper-catalog-source-index/rule.json | rule-json |  |
| .habitat/civ7/mapgen/studio/run-in-game/rules/structure-swooper-catalog-source-index/structure.toml | structure-spec |  |
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
| .habitat/civ7/resources/civ7-types/rules/block_hand_edits_to_generated_civ7_types/rule.json | rule-json |  |
| .habitat/civ7/resources/map-policy/rules/block_hand_edits_to_generated_map_policy_tables/rule.json | rule-json |  |
| .habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/pattern.md | pattern | ./policy-grid.js; ./types.js; packages/civ7-map-policy/src/. |
| .habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/rule.json | rule-json |  |
| .habitat/civ7/resources/map-policy/rules/preserve_evidence_provenance_labels/check.ts | check-script | "git" ["rev-parse", "--show-toplevel"] {<br>  encoding: "utf8",<br>}; node:child_process; node:fs |
| .habitat/civ7/resources/map-policy/rules/preserve_evidence_provenance_labels/rule.json | rule-json |  |
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
| .habitat/docs/rules/ensure_docs_checkout_paths_are_portable/pattern.md | pattern | >; grit<br>language markdown<br><br>function docs_local_checkout_rewrite_path($body) js {<br>  return $body.text.replace(/\/(?:Users\|home\|Volumes)\/[^ |
| .habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json | rule-json |  |
| .habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/fix.mjs | fix-script | node:fs/promises; node:path; --write |
| .habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/operation.md | operation-note | --write; > |
| .habitat/global/workspace/_blueprints/project-boundary-model/enforce_workspace_import_boundaries/rule.json | rule-json |  |
| .habitat/global/workspace/_blueprints/project-boundary-model/validate_boundary_taxonomy_against_workspace_graph/check.sh | check-script | tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts; bun tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts |
| .habitat/global/workspace/_blueprints/project-boundary-model/validate_boundary_taxonomy_against_workspace_graph/rule.json | rule-json |  |
| .habitat/global/workspace/rules/enforce_formatting_and_import_hygiene/check.sh | check-script | bun run biome:ci |
| .habitat/global/workspace/rules/enforce_formatting_and_import_hygiene/rule.json | rule-json |  |
| .habitat/global/workspace/rules/prohibit_pnpm_files_in_bun_workspace/rule.json | rule-json |  |
| .habitat/global/workspace/rules/require_owner_workflow_for_host_protected_surfaces/rule.json | rule-json |  |
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
