# Execution Surface Anatomy

This companion report separates runnable behavior from adapter glue, runner/runtime code, policy predicates, fixture/support files, and transient dependencies. It is analysis only; it does not decide removals.

## Read

- Grit pattern examples in `.pattern.md` are not treated as fixture/support unless a runtime consumes them as separate support files.
- Build/currentness and package-local command ties are flagged as transient dependency candidates for later pruning.

## Anatomy Roles

| role | surface count |
| --- | --- |
| policy-predicate | 90 |
| adapter | 108 |
| transient-dependency | 145 |
| fixture-support | 3 |
| entrypoint | 341 |
| runner-runtime | 119 |

## Surface Families

| family | count | sample read |
| --- | --- | --- |
| pattern | 68 | .habitat/blueprints/artifact/require_artifact_catalog_index_shape/pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/blueprints/artifact/require_artifact_file_shape/pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files.<br>.habitat/blueprints/domain-atom/require_domain_atom_owner_shape/pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| rule-json | 108 | .habitat/blueprints/artifact/require_artifact_catalog_index_shape/rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/blueprints/artifact/require_artifact_file_shape/rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text.<br>.habitat/blueprints/artifact/require_artifact_index_aggregate_shape/rule.json: Runner metadata that selects owner tool, scan roots, path coverage, detect command text, and reporting text. |
| structure-spec | 21 | .habitat/blueprints/artifact/require_artifact_index_aggregate_shape/structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner.<br>.habitat/blueprints/cli-shell/require_cli_shell_project_topology/structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner.<br>.habitat/blueprints/cli-topic-plugin/require_cli_topic_plugin_project_topology/structure.toml: Structure-check TOML authority: declarative file-tree topology consumed by the native Habitat structure-check runner. |
| check-script | 16 | .habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/check.ts: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/check.mjs: Command-check executable surface invoked through Habitat metadata or direct references.<br>.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/check.ts: Command-check executable surface invoked through Habitat metadata or direct references. |
| apply-pattern | 1 | .habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md: Grit pattern authority: pattern text and embedded examples stay local unless another runtime consumes separate support files. |
| generate-script | 2 | .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/generate.sh: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition.<br>.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/generate.ts: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| operation-note | 3 | .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/operation.md: Classified execution surface.<br>.habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/operation.md: Classified execution surface.<br>.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/operation.md: Classified execution surface. |
| fix-script | 1 | .habitat/docs/rules/repair_docs_issue_links_and_dependency_metadata/fix.mjs: Operation executable surface; mutation/build behavior is expected and should not be confused with policy definition. |
| package-script | 197 | apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/package.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-target | 129 | apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work.<br>apps/docs/project.json: Workspace entrypoint that may invoke Habitat or package-local work. |
| nx-plugin | 2 | nx.json: Classified execution surface.<br>nx.json: Classified execution surface. |
| nx-target-default | 11 | nx.json: Classified execution surface.<br>nx.json: Classified execution surface.<br>nx.json: Classified execution surface. |
| habitat-cli-source | 119 | tools/habitat/src/cli/base/command-lifecycle.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/base/HabitatCommand.ts: Toolkit runner/provider code that executes or routes rule surfaces.<br>tools/habitat/src/cli/commands/check.ts: Toolkit runner/provider code that executes or routes rule surfaces. |

## Transient Dependency Candidates

| path | kind | signals |
| --- | --- | --- |
| .habitat/blueprints/domain/require_domain_entrypoint_shape/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/check.mjs | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/rules/require_mapgen_exported_value_declarations_have_jsdoc/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/check.ts | check-script | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-attribution-report-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-copy-deploy-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-map-render-file-plan-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/run-in-game/rules/grit-swooper-run-manifest-generator-boundary/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mapgen/studio/runtime/rules/preserve_studio_event_driven_runtime_boundaries/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/mod-sdk/rules/require_explicit_mapgen_sdk_opt_in/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/civ7/platform/control-orpc/rules/preserve_transport_pure_orpc_contracts/pattern.md | pattern | build/currentness or ordering tie |
| .habitat/docs/_blueprints/docs-site/generate_docs_sidebar_from_docs_tree/generate.sh | generate-script | build/currentness or ordering tie |
| apps/docs/project.json | nx-target | build/currentness or ordering tie |
| apps/docs/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mapgen-studio/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/mods/map/swooper-physics/project.json | nx-target | build/currentness or ordering tie |
| apps/playground/package.json | package-script | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/package.json | package-script | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-civ7-intelligence-bridge/project.json | nx-target | build/currentness or ordering tie |
| mods/mod-swooper-civ-dacia/package.json | package-script | build/currentness or ordering tie |
| mods/mod-swooper-civ-dacia/project.json | nx-target | build/currentness or ordering tie |

## Fixture/Support Files

| path | support file | virtual filenames | lines |
| --- | --- | --- | --- |
| .habitat/_support/execution/command-check/mapgen-static-check-lib.mjs | mapgen-static-check-lib | 0 | 54 |
| .habitat/_support/execution/README.md | README | 0 | 18 |
