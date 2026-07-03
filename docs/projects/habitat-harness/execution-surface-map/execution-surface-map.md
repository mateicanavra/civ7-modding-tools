# Execution Surface Map

Deterministic analytics for the Habitat authority execution surface. This report maps what can be executed, who invokes it, and what it reaches into. `rule.json` is treated as runner metadata, not policy authority.

## Sanity Assertions

- Passed: 73 `.rule.json`, 0 active source-check `.rule.mjs`, 0 transitional runtime imports, root `docs:project`, and `tools/habitat` `generate:schemas` were detected.

## Surfaces By Kind

| kind | count |
| --- | --- |
| apply-pattern | 2 |
| pattern | 36 |
| rule-json | 73 |
| check-script | 33 |
| fix-script | 1 |
| operation-note | 2 |
| generate-script | 1 |
| package-script | 136 |
| nx-target | 55 |
| nx-plugin | 1 |
| nx-target-default | 9 |
| habitat-cli-source | 124 |

## Surfaces By Role

| role | count |
| --- | --- |
| policy_pattern | 38 |
| runner_metadata | 73 |
| command_check_executor | 33 |
| operation_surface | 4 |
| workspace_entrypoint | 201 |
| toolkit_runner | 124 |

## Execution Anatomy Roles

| anatomy role | surface count |
| --- | --- |
| policy-predicate | 38 |
| transient-dependency | 141 |
| adapter | 73 |
| entrypoint | 235 |
| fixture-support | 9 |
| runner-runtime | 124 |

## `.rule.mjs` Anatomy

- Total modules: 0
- Expected export shape: 0
- Transitional runtime imports: 0
- Separable fixture/support candidates: 0
- Candidate extensions: none

_None._

## `.rule.mjs` Module Details

_None._

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 161 |
| .habitat/_support/execution/README.md | README | 0 | 18 |

## Entrypoints By Invoker

| invoker | count |
| --- | --- |
| unknown | 8 |
| habitat | 263 |
| direct-script | 36 |
| package | 137 |
| nx | 65 |

## Buckets

| bucket | count |
| --- | --- |
| mutation_surface | 119 |
| package_boundary_tie | 61 |
| unknown_invocation | 8 |
| habitat_invoked | 263 |
| nx_ordering_tie | 105 |
| direct_script_invoked | 36 |
| package_invoked | 202 |

## Top Cross-Boundary Ties By Fanout

| target class | target | source count | references | sample sources |
| --- | --- | --- | --- | --- |
| workspace-tool | grit-check | 38 | 71 | .habitat/civ7/mapgen/core/blueprints/mapgen-core-library/boundary/check/prohibit_runtime_helper_redeclarations/prohibit_runtime_helper_redeclarations.rule.json<br>.habitat/civ7/mapgen/core/blueprints/mapgen-core-library/execution/check/preserve_mapgen_core_runtime_neutrality/preserve_mapgen_core_runtime_neutrality.rule.json<br>.habitat/civ7/mapgen/domain/blueprints/_self/structure/check/prohibit_retired_domain_root_catalogs/prohibit_retired_domain_root_catalogs.rule.json |
| workspace-tool | git | 23 | 23 | .habitat/civ7/mapgen/domain/blueprints/domain-public-surface/boundary/check/require_public_domain_surfaces_in_tests/require_public_domain_surfaces_in_tests.check.mjs<br>.habitat/civ7/mapgen/map-output/blueprints/generated-map-entrypoint/artifact/check/validate_generated_map_entrypoint_contracts/validate_generated_map_entrypoint_contracts.check.ts<br>.habitat/civ7/mapgen/map-output/blueprints/shipped-map-catalog/artifact/check/block_studio_config_leakage_into_shipped_catalog/block_studio_config_leakage_into_shipped_catalog.check.ts |
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
| relative | ../../../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs | 8 | 16 | .habitat/civ7/mapgen/domain/blueprints/domain-config-surface/contract/check/require_owned_domain_config_catalog_surfaces/require_owned_domain_config_catalog_surfaces.check.mjs<br>.habitat/civ7/mapgen/domain/blueprints/foundation-domain/contract/check/preserve_decomposed_foundation_contract_surfaces/preserve_decomposed_foundation_contract_surfaces.check.mjs<br>.habitat/civ7/mapgen/domain/blueprints/morphology-domain/contract/check/preserve_morphology_contracts_and_overlay_ownership/preserve_morphology_contracts_and_overlay_ownership.check.mjs |
| relative | ./ | 8 | 8 | .habitat/civ7/mapgen/domain/blueprints/_self/boundary/check/enforce_domain_refactor_boundary_profile/enforce_domain_refactor_boundary_profile.check.sh<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls/prohibit_cross_op_runtime_calls.pattern.md<br>.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_root_config_facade_imports_in_domain_ops/prohibit_root_config_facade_imports_in_domain_ops.pattern.md |
| relative | ./request.js | 7 | 14 | tools/habitat/src/providers/grit/index.ts<br>tools/habitat/src/providers/grit/runner.ts<br>tools/habitat/src/resources/command/index.ts |
| workspace-tool | nx | 7 | 8 | .habitat/global/workspace/blueprints/project-boundary-model/boundary/check/enforce_workspace_import_boundaries/enforce_workspace_import_boundaries.rule.json<br>tools/habitat/src/providers/nx/index.ts<br>tools/habitat/src/service/model/rules/dto/registry.schema.ts |
| habitat-toolkit | @habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy | 7 | 7 | tools/habitat/src/providers/grit/diagnostics.ts<br>tools/habitat/src/providers/grit/failure.ts<br>tools/habitat/src/providers/grit/resource.ts |
| workspace-tool | tsc --noEmit | 7 | 7 | apps/mapgen-studio/project.json#targets.check<br>mods/mod-civ7-intelligence-bridge/package.json#scripts.check<br>mods/mod-swooper-maps/project.json#targets.check |
| relative | ./context.policy.js | 6 | 12 | tools/habitat/src/service/model/check/policy/structural/command-execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/execution.policy.ts<br>tools/habitat/src/service/model/check/policy/structural/file-layer-execution.policy.ts |
| relative | ./shared.schema.js | 6 | 12 | tools/habitat/src/service/modules/fix/model/dto/index.ts<br>tools/habitat/src/service/modules/fix/model/dto/pattern-apply-record.schema.ts<br>tools/habitat/src/service/modules/fix/model/dto/pattern-apply-request.schema.ts |
| habitat-toolkit | @habitat/cli/cli/base/HabitatCommand | 6 | 6 | tools/habitat/src/cli/commands/check.ts<br>tools/habitat/src/cli/commands/classify.ts<br>tools/habitat/src/cli/commands/fix.ts |

## Direct Package Or Root Scripts Calling `.habitat` Internals

| package | script | command |
| --- | --- | --- |
| package.json | docs:project | ./.habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.generate.sh && bunx docsify-cli serve ./docs --port 7979 |
| tools/habitat/package.json | generate:schemas | bun run ../../.habitat/habitat/toolkit/blueprints/generator/contract/triage/preserve_generator_schema_contracts/write-preserve_generator_schema_contracts.ts |

## `.rule.mjs` Files Importing Transitional Habitat Runtime

_None._

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
| .habitat/civ7/mapgen/pipeline/blueprints/_self/policy/check/prohibit_ambient_rng_in_authored_generation/prohibit_ambient_rng_in_authored_generation.pattern.md | pattern | generate; mods/mod-swooper-maps/src/; grit<br>language js(typescript)<br><br>or {<br>  contains r"\.\s*getRandomNumber\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\bMath\s*\.\s*random\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  contains r"\.\s*(?:generateLakes\|designateBiomes\|addFeatures\|generateSnow\|generateResources\|generateOfficialResources\|generateDiscoveries\|generateOfficialDiscoveries\|assignStartPositions\|chooseStartSectors)\s*\(" where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$"<br>  },<br>  import_statement(source=$source) where {<br>    $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard)/.*\.ts$",<br>    $source <: r"^[\"']?@swooper/mapgen-core/lib/rng[\"']?$"<br>  }<br>} |
| .habitat/civ7/mapgen/pipeline/blueprints/_self/structure/check/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases.pattern.md | pattern | mods/mod-swooper-maps/src/; grit<br>language js(typescript)<br><br>or {<br>  contains r"\bdualRead",<br>  contains r"\bdual[-_ ]?engine",<br>  contains r"\bdual[-_ ]?path",<br>  contains r"\bshadow(?:Path\|Compute\|Layer\|Mode\|Toggle\|Bridge)",<br>  contains r"\bcompare(?:Layer\|Layers\|Mode\|Toggle\|Only\|Path)",<br>  contains r"\bcomparison(?:Layer\|Layers\|Mode\|Toggle\|Only\|Path)",<br>  contains r"\bshim(?:med\|ming\|s)?\b",<br>  contains r"\bcompat(?:ibility)?[-_ ]?(shim\|bridge)\b",<br>  contains r"\btransitional[-_ ]?(shim\|bridge)\b",<br>  contains r"\"hydrology-pre\"",<br>  contains r"\"hydrology-core\"",<br>  contains r"\"hydrology-post\"",<br>  contains r"\"narrative-pre\"",<br>  contains r"\"narrative-mid\"",<br>  contains r"\"narrative-post\""<br>} where {<br>  $filename <: r".*mods/mod-swooper-maps/src/(?:domain\|recipes/standard\|maps)/.*\.(?:ts\|json)$"<br>} |
| .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.fix.mjs | fix-script | node:fs/promises; node:path; --write |
| .habitat/docs/blueprints/_self/quality/fix/repair_docs_issue_links_and_dependency_metadata/repair_docs_issue_links_and_dependency_metadata.operation.md | operation-note | --write; > |
| .habitat/docs/blueprints/docs-site/artifact/generate/generate_docs_sidebar_from_docs_tree/generate_docs_sidebar_from_docs_tree.operation.md | operation-note | generate |
| .habitat/habitat/toolkit/blueprints/service-module/structure/check/enforce_habitat_orpc_service_wiring_shape/enforce_habitat_orpc_service_wiring_shape.pattern.md | pattern | >; ../../impl.js; ../module.js |

## Stale Detect Targets

_None._

## Raw Data

Complete records are committed in `execution-surface-map.json`.
