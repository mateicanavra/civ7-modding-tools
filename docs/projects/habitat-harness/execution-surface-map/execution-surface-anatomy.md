# Execution Surface Anatomy

This companion report separates runnable behavior from adapter glue, runner/runtime code, policy predicates, fixture/support files, and transient dependencies. It is analysis only; it does not decide removals.

## Read

- Grit pattern examples in `.pattern.md` are not treated as fixture/support unless a runtime consumes them as separate support files.
- Build/currentness and package-local command ties are flagged as transient dependency candidates for later pruning.

## Anatomy Roles

| role | surface count |
| --- | --- |
| fixture-support | 9 |
| adapter | 121 |
| policy-predicate | 89 |
| transient-dependency | 110 |
| entrypoint | 242 |
| runner-runtime | 112 |

## Surface Families

| family | count | sample read |
| --- | --- | --- |
| check-script | 28 | .habitat/blueprints/artifact/prohibit_realized_map_artifact_tags/check.mjs: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/blueprints/artifact/require_artifact_index_aggregate_shape/check.mjs: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/blueprints/domain/require_public_domain_surfaces_in_tests/check.mjs: Command-check executable surface invoked through Habitat metadata or direct references. |
| rule-json | 121 | .habitat/blueprints/artifact/prohibit_realized_map_artifact_tags/rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/blueprints/artifact/require_artifact_file_shape/rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/blueprints/artifact/require_artifact_index_aggregate_shape/rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text. |
| pattern | 80 | .habitat/blueprints/artifact/require_artifact_file_shape/pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/blueprints/dependency-tag/require_typed_dependency_and_effect_tag_constants/pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| structure-spec | 8 | .habitat/blueprints/domain/prohibit_domain_artifacts_modules/structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner.<br>.habitat/blueprints/domain/require_domain_source_topology/structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner.<br>.habitat/civ7/mapgen/domains/ecology/rules/require_ecology_canonical_op_module_topology/structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner. |
| apply-pattern | 1 | .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| generate-script | 2 | .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/generate.sh: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition.<br>.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/generate.ts: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| operation-note | 3 | .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/operation.md: Classified execution surface.<br>.habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/operation.md: Classified execution surface.<br>.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/operation.md: Classified execution surface. |
| fix-script | 1 | .habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/fix.mjs: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| package-script | 139 | apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-target | 91 | apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-plugin | 1 | nx.json: Classified execution surface. |
| nx-target-default | 9 | nx.json: Classified execution surface.<br>nx.json: Classified execution surface.<br>nx.json: Classified execution surface. |
| habitat-cli-source | 112 | tools/habitat/src/cli/base/HabitatCommand.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/check.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/classify.ts: Toolkit runner/provider code that executes or routes rule surfaces. |

## Transient Dependency Candidates

| path | kind | signals |
| --- | --- | --- |
| .habitat/blueprints/recipe-step/require_domain_contract_roots_in_step_contracts/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_strategy_nonlocal_imports/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/domains/morphology/rules/require_morphology_public_surface_imports/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/check.mjs | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_wrapper_only_advanced_config/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_misplaced_projection_adapter_calls/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/require_projection_calls_in_projection_steps/check.mjs | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/check.ts | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-copy-deploy-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-map-render-file-plan-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-run-manifest-generator-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mod-sdk/rules/require_explicit_mapgen_sdk_opt_in/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/platform/control-orpc/rules/preserve_transport_pure_orpc_contracts/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/generate.sh | generate-script | build/currentness or ordering tie |
| apps/docs/project.json | nx-target | build/currentness or ordering tie |
| apps/docs/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/package.json | package-script | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/playground/package.json | package-script | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/package.json | package-script | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-civ-dacia/package.json | package-script | build/currentness or ordering tie |
| mods/mod-swooper-civ-dacia/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-civ-dacia/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-maps/project.json | nx-target | build/currentness or ordering tie |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 161 |
| .habitat/_support/execution/README.md | README | 0 | 18 |
