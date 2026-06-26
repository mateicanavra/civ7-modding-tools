# Rule/Adapter Disposition Matrix

Status: synthesized from six lane artifacts

## Coverage

- Canonical rule records: 73
- Centralized source-check adapters in crosswalk: 33
- Active `ownerTool: source-check` rule records: 29
- Active source-check adapters: 29
- Stale adapters for non-source-check records: `prohibit_ambient_rng_in_authored_generation`, `prohibit_cross_op_runtime_calls`, `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`, `require_public_ecology_surfaces_and_retired_topology_removal`

## Disposition Counts

| Disposition | Count |
| --- | ---: |
| `data_driven_import_path_rule` | 8 |
| `grit_pattern_authority` | 37 |
| `needs_split` | 16 |
| `package_local_test_or_validator` | 12 |

## Grit Pattern Authority

| Rule | Lane | Owner Tool | Adapter | Split | Feasibility |
| --- | --- | --- | --- | --- | --- |
| `block_adapter_context_imports_from_domain_ops` | mapgen-domain | source-check | yes | no | high: existing .pattern.md covers the adapter predicate as structural source matching with filename constraints; no runtime/product oracle is involved. |
| `block_engine_runtime_imports_from_domain_ops` | mapgen-domain | source-check | yes | no | high: existing .pattern.md is a direct structural import_statement rule with type-import exclusions. |
| `enforce_adapter_only_base_standard_imports` | platform-resources | source-check | yes | no | excellent: existing pattern.md already expresses the adapter predicate with structural TypeScript imports and path filters. |
| `enforce_studio_rpc_eventhub_topology` | mapgen-other | command-check | no | no | high: source presence/absence and call/object-shape constraints over fixed TS files are Grit pattern authority candidates |
| `ensure_map_policy_dependency_independence` | platform-resources | command-check | no | no | strong: pure import/export legality over TypeScript source with a small forbidden-specifier list and exact package path scope. |
| `preserve_mapgen_core_runtime_neutrality` | mapgen-other | source-check | yes | no | high: existing .pattern.md expresses import, identifier, and source-text constraints with path guards |
| `preserve_physics_to_map_projection_contracts` | mapgen-other | command-check | no | no | high: path-scoped string/source matching and effect-name regex constraints are clean Grit pattern authority candidates |
| `preserve_transport_pure_orpc_contracts` | platform-resources | source-check | yes | no | excellent: existing pattern.md expresses all adapter predicate branches with structural imports, export const matching, export-from matching, regex name filters, and path filters. |
| `prohibit_adapter_local_legacy_generator_logic` | platform-resources | command-check | no | no | strong: path-scoped identifier, call-expression, and string/module-token bans are structural source matching that Grit should express cleanly. |
| `prohibit_ambient_rng_in_authored_generation` | mapgen-pipeline | command-check | yes | no | high: existing pattern expresses the source/path/import bans; conversion must carry the current discovery materialization exception or intentionally delete it. |
| `prohibit_bare_value_export_all_from_contract_surfaces` | mapgen-pipeline | source-check | yes | no | high: existing pattern captures export-all syntax, text-filtered type-only allowance, and path scope. |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | mapgen-pipeline | command-check | yes | no | high: existing pattern expresses the source token and retired stage alias bans; the adapter's dual-stage-pair check becomes redundant if legacy aliases are directly banned. |
| `prohibit_domain_ops_projection_effect_dependencies` | mapgen-other | source-check | yes | no | high: existing .pattern.md cleanly captures path-scoped string/source matching |
| `prohibit_empty_object_defaults_in_contract_schemas` | mapgen-pipeline | source-check | yes | no | high: existing Grit pattern directly represents the property/default object-literal predicate and scoped contract paths. |
| `prohibit_product_scan_roots_in_grit_provider` | global-docs-toolkit | grit-check | no | no | already Grit: the existing TypeScript Grit pattern text-matches provider source under tools/habitat/src/providers/grit. |
| `prohibit_recipe_imports_in_domain_source` | mapgen-domain | source-check | yes | no | high: existing .pattern.md directly expresses the predicate with filename and source constraints. |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | mapgen-domain | source-check | yes | no | high: existing .pattern.md expresses all file-depth import/export cases as filename/source regex constraints. |
| `prohibit_retired_domain_root_catalogs` | mapgen-domain | source-check | yes | no | high: existing .pattern.md is a direct filename-only structural pattern. |
| `prohibit_root_config_facade_imports_in_domain_ops` | mapgen-domain | source-check | yes | no | high: existing .pattern.md cleanly expresses filename and source constraints. |
| `prohibit_runtime_calls_to_runvalidated` | mapgen-pipeline | source-check | yes | no | high: existing pattern expresses direct/property call matching with path scope. |
| `prohibit_runtime_helper_redeclarations` | mapgen-other | source-check | yes | no | high: existing .pattern.md covers the structural declarations; existing .apply.pattern.md covers optional rewrite behavior separately |
| `prohibit_runtime_local_config_default_merging` | mapgen-pipeline | source-check | yes | no | high: existing pattern expresses both syntax forms with path scope; confirm alias/default helper variants are intentionally out of scope before conversion. |
| `prohibit_runtime_orchestration_helpers_in_domain_ops` | mapgen-domain | source-check | yes | no | high: existing .pattern.md directly matches the call expressions with filename constraints. |
| `prohibit_runtime_validation_and_compiler_imports` | mapgen-pipeline | source-check | yes | no | high: import-source bans with path scope are a straightforward Grit authority target. |
| `prohibit_sibling_stage_private_step_imports` | mapgen-pipeline | source-check | yes | no | high: existing Grit import_statement pattern expresses the adapter predicate with path and import-source scope. |
| `prohibit_wrapper_only_advanced_config` | mapgen-pipeline | source-check | yes | no | high: existing pattern directly matches the adapter predicate, including TS/JSON path scope and positive/negative fixtures. |
| `require_domain_contract_roots_in_step_contracts` | mapgen-domain | source-check | yes | no | high: existing .pattern.md directly expresses path-scoped import/export source constraints. |
| `require_narrow_game_ui_bridge_bootstrap` | platform-resources | command-check | no | no | strong but with one presence-check caveat: forbidden imports/tokens are direct Grit matches, and required import/install shape should be expressible with contains/not over the exact file. |
| `require_public_domain_surfaces_in_recipes_and_maps` | mapgen-domain | source-check | yes | no | high: existing .pattern.md expresses the check; existing .apply.pattern.md is a separate fix operation candidate, not a runtime fixture. |
| `require_public_domain_surfaces_in_tests` | mapgen-domain | command-check | no | no | high: this is path-scoped import/export source matching; no package runtime behavior is checked. |
| `require_runtime_domain_op_bundle_imports` | mapgen-pipeline | source-check | yes | no | high: existing Grit import_statement source regex matches the adapter predicate. |
| `require_sanctioned_direct_control_session_owners` | platform-resources | source-check | yes | no | excellent: existing pattern.md expresses constructor matching, path filters, owner exceptions, and test exclusions. |
| `require_shared_visualization_contracts_at_stage_surfaces` | mapgen-pipeline | source-check | yes | no | high: pattern spells out the helper's path/import cases directly and includes fixtures. |
| `require_studio_ui_recipe_artifact_imports` | mapgen-other | source-check | yes | no | high: existing .pattern.md captures the same import-source predicate and path exceptions |
| `require_typed_dependency_and_effect_tag_constants` | mapgen-pipeline | source-check | yes | no | high: existing pattern expresses the defineStep/requires/provides/string-literal predicate with fixtures. |
| `require_typed_placement_outcomes_before_apply` | mapgen-other | source-check | yes | no | high: existing .pattern.md is a direct structural call-expression pattern |
| `restrict_recipes_to_public_domain_surfaces` | mapgen-domain | source-check | yes | no | high: existing .pattern.md directly expresses the allowed/forbidden source classes with path scope. |

## Needs Split

| Rule | Lane | Owner Tool | Adapter | Split | Feasibility |
| --- | --- | --- | --- | --- | --- |
| `block_unapproved_base_standard_boundary_leaks` | platform-resources | command-check | no | yes | mixed: the runtime import boundary overlaps the existing enforce_adapter_only_base_standard_imports Grit/source-check rule, but the broad string scan and allowlist debt are not clean Grit authority as written. |
| `enforce_domain_refactor_boundary_profile` | mapgen-domain | command-check | no | yes | mixed: many rg-style source predicates can become Grit or data-driven rules, but the profile wrapper, env gating, JSDoc/schema checks, missing-file topology checks, and duplicated assertions should not remain one Habitat rule. |
| `enforce_studio_dev_runner_topology` | mapgen-other | command-check | no | yes | low for whole rule: JSON target dependency/order assertions and config loading are not Grit; some source-token/file-existence assertions are separable |
| `ensure_docs_checkout_paths_are_portable` | global-docs-toolkit | command-check | no | yes | high for the text/rewrite predicate: the existing markdown Grit pattern already expresses the suffix-based rewrite. The command-check diagnostic duplicates part of that behavior. |
| `preserve_decomposed_foundation_contract_surfaces` | mapgen-domain | command-check | no | yes | mixed: import/text bans and re-export shim scans are Grit candidates; expected-presence assertions and exact contract/source currentness are better split into data-driven structural checks or package-local validators. |
| `preserve_morphology_contracts_and_overlay_ownership` | mapgen-domain | command-check | no | yes | mixed: source text/import bans are Grit candidates; exact expected contract contents and single-owner publisher assertions need a separate data-driven or package-local validation model. |
| `preserve_standard_stage_topology_and_path_invariants` | mapgen-pipeline | command-check | no | yes | medium: legacy alias text bans are Grit-friendly, but exact stage-order and directory-topology parity should become a data-driven topology rule or manifest-backed check. |
| `prohibit_cross_op_runtime_calls` | mapgen-domain | command-check | yes | yes | mixed-high: cross-op import/export/dynamic predicate is already Grit; ops.bind/runValidated overlaps with prohibit_runtime_orchestration_helpers_in_domain_ops and should consolidate rather than stay duplicated here. |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | mapgen-pipeline | command-check | no | yes | medium-high: most assertions are path-scoped token/source bans that Grit can express, but the packet mixes semantic ecology policy, runtime-adjacent RNG bans, and legacy generator boundary bans. |
| `require_explicit_mapgen_sdk_opt_in` | mapgen-other | source-check | yes | yes | mixed-high: SDK opt-in entrypoint checks are Grit-shaped, but the mapgen-core adapter-import ban overlaps preserve_mapgen_core_runtime_neutrality and should split before adapter deletion. |
| `require_owned_domain_config_catalog_surfaces` | mapgen-domain | command-check | no | yes | mixed: op import bans and milestone token bans are Grit/source-text candidates; exact export list and required-token presence are better split into data-driven structural checks. |
| `require_projection_calls_in_projection_steps` | mapgen-other | command-check | no | yes | medium: forbidden call placement is Grit-shaped, but exact caller ownership lists and required source/contract token assertions should be separated before conversion |
| `require_public_ecology_surfaces_and_retired_topology_removal` | mapgen-domain | command-check | yes | yes | mixed-high: import/export and retired-path predicates are already Grit; active-root existence is a separate topology/currentness assertion and should not block extracting the source predicates. |
| `require_recipe_dag_contract_metadata` | mapgen-other | command-check | no | yes | medium: direct import/source bans are Grit-shaped, but local import-graph closure and expected graph membership require a graph-aware validator or package-local boundary test |
| `validate_mapgen_docs_anchors_and_references` | global-docs-toolkit | command-check | no | yes | medium: toc/heading/alias/text-shape checks are plausible Grit markdown authority, but anchor target existence and router target liveness remain validator behavior. |
| `verify_standard_recipe_public_authoring_surface` | mapgen-pipeline | command-check | no | yes | low for the whole rule: the main oracle is derived authoring-model semantics, though a few static sub-assertions may become separate structural checks. |

## Data-Driven Import/Path Rule

| Rule | Lane | Owner Tool | Adapter | Split | Feasibility |
| --- | --- | --- | --- | --- | --- |
| `block_hand_edits_to_generated_civ7_types` | platform-resources | file-layer | no | no | not a Grit candidate: the oracle is staged generated-file protection, not source-pattern matching inside file contents. |
| `block_hand_edits_to_generated_map_policy_tables` | platform-resources | file-layer | no | no | not a Grit candidate: the oracle is staged generated-file protection, not source-pattern matching inside file contents. |
| `block_studio_config_leakage_into_shipped_catalog` | mapgen-other | command-check | no | no | medium-low: concept is simple text matching, but target files are XML/modinfo artifacts rather than TypeScript source; a generic data-driven file-token rule would delete more state than bespoke command code |
| `enforce_workspace_import_boundaries` | global-docs-toolkit | nx | no | no | low: the import edges are graph/taxonomy facts already owned by Nx boundary enforcement, not a standalone source pattern. |
| `prohibit_pnpm_artifacts_in_bun_workspace` | global-docs-toolkit | file-layer | no | no | low: this is staged path/file-name guard metadata, better represented as a generic file-layer rule than a source pattern. |
| `protect_generated_map_entrypoints_from_hand_edits` | mapgen-other | file-layer | no | no | low: this is staged-file generated-zone protection, not AST/source pattern matching |
| `require_owner_workflow_for_host_protected_surfaces` | global-docs-toolkit | file-layer | no | no | low: this is staged mutation policy against host declarations, not static source matching. |
| `validate_habitat_service_module_file_shape` | global-docs-toolkit | command-check | no | no | medium for loose-file suffix bans, low for required-file/directory completeness. A data-driven file-tree shape runner would delete more state than a large Grit pattern. |

## Package-Local Test Or Validator

| Rule | Lane | Owner Tool | Adapter | Split | Feasibility |
| --- | --- | --- | --- | --- | --- |
| `enforce_formatting_and_import_hygiene` | global-docs-toolkit | format-check | no | no | low: this is whole-workspace formatter/import hygiene from the formatter provider, not a subject-specific structural predicate worth expressing as Grit. |
| `ensure_studio_worker_bundle_is_browser_safe` | mapgen-other | command-check | no | no | low: built bundle/runtime artifact inspection belongs to package build validation, not authored source pattern authority |
| `preserve_evidence_provenance_labels` | platform-resources | command-check | no | no | possible for text matching, but not preferred: the oracle is generated-output/provenance correctness and remediation is regeneration, so the stronger owner is the civ7-map-policy generator/verify path. |
| `validate_boundary_taxonomy_against_workspace_graph` | global-docs-toolkit | command-check | no | no | low: the oracle is cross-artifact graph/config consistency, not local structural source matching. |
| `validate_docs_site_config_inputs` | global-docs-toolkit | command-check | no | no | low to medium: Grit could text-match JSON fragments, but the real oracle is docs app config validity and required site input presence. |
| `validate_generated_map_entrypoint_contracts` | mapgen-other | command-check | no | no | low: hash/schema validation and generated-output currentness are runtime/package or generator correctness, not source-shape pattern authority |
| `verify_docs_site_link_integrity` | global-docs-toolkit | command-check | no | no | low: the oracle is Mintlify link resolution/build behavior, not static source matching. |
| `verify_habitat_cli_smoke_contract` | global-docs-toolkit | command-check | no | no | none: this is CLI runtime/contract behavior, not file/source shape. |
| `verify_runtime_stage_order_matches_contract_manifest` | mapgen-pipeline | command-check | no | no | low: oracle is runtime/module-export parity between two package surfaces, not static source syntax. |
| `verify_standard_recipe_artifacts_match_source_stages` | mapgen-pipeline | command-check | no | no | low: oracle is generated artifact currentness and package authoring behavior, not static source shape. |
| `verify_studio_recipe_artifacts_are_current` | mapgen-other | command-check | no | no | none: generated artifact currentness and build ordering are package/Nx proof, not source pattern authority |
| `verify_visualization_runtime_build_artifacts` | mapgen-other | command-check | no | no | none: missing build artifacts and dependency freshness are package/Nx currentness concerns, not source pattern authority |

## Delete Or Demote

Canonical rule rows do not currently land here. The delete/demote findings are adapter-support findings in `lanes/adapter-crosswalk.md`: the four stale adapters for command-check-owned records.

## Actionable Read

- The highest-leverage next move is not another inventory pass. Convert the active source-check adapter rows that already have adjacent Grit pattern authority. There are 28 direct adapter-backed Grit rows before split/consolidation work.
- The four stale adapters are not selected by current source-check records and should be deleted or demoted after confirming command-check/pattern coverage.
- Broad command-check bundles are the main source of state explosion. Treat `needs_split` rows as assertion-level extraction work, not as whole-packet conversions.
- File-layer, Nx, generated-zone, and graph-backed rows fit the allowed enum imperfectly. They are kept in `data_driven_import_path_rule` with notes instead of expanding the classification vocabulary midstream.
