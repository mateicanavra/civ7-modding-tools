# Next Grit Extraction Slices

Status: updated after final source-check runtime deletion

## Completed Canary

Deleted stale adapters for command-check records:

- `prohibit_ambient_rng_in_authored_generation`
- `prohibit_cross_op_runtime_calls`
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`
- `require_public_ecology_surfaces_and_retired_topology_removal`

Converted to `grit-check` and deleted active source-check adapters:

- `block_engine_runtime_imports_from_domain_ops`
- `preserve_transport_pure_orpc_contracts`
- `prohibit_runtime_helper_redeclarations`

## Completed Systematic Burn-Down

Goal completed: wire active source-check adapter rows through Grit pattern authority where the inventory already classified them as direct Grit candidates, then delete their adapters.

Converted and deleted adapters:

- `block_adapter_context_imports_from_domain_ops`
- `enforce_adapter_only_base_standard_imports`
- `preserve_mapgen_core_runtime_neutrality`
- `prohibit_bare_value_export_all_from_contract_surfaces`
- `prohibit_domain_ops_projection_effect_dependencies`
- `prohibit_empty_object_defaults_in_contract_schemas`
- `prohibit_recipe_imports_in_domain_source`
- `prohibit_relative_domain_reaches_from_recipes_and_maps`
- `prohibit_retired_domain_root_catalogs`
- `prohibit_root_config_facade_imports_in_domain_ops`
- `prohibit_runtime_calls_to_runvalidated`
- `prohibit_runtime_local_config_default_merging`
- `prohibit_runtime_orchestration_helpers_in_domain_ops`
- `prohibit_runtime_validation_and_compiler_imports`
- `prohibit_sibling_stage_private_step_imports`
- `prohibit_wrapper_only_advanced_config`
- `require_domain_contract_roots_in_step_contracts`
- `require_public_domain_surfaces_in_recipes_and_maps`
- `require_runtime_domain_op_bundle_imports`
- `require_sanctioned_direct_control_session_owners`
- `require_shared_visualization_contracts_at_stage_surfaces`
- `require_studio_ui_recipe_artifact_imports`
- `require_typed_dependency_and_effect_tag_constants`
- `require_typed_placement_outcomes_before_apply`
- `restrict_recipes_to_public_domain_surfaces`

## Completed Final Source-Check Holdback Split

Goal completed: split `require_explicit_mapgen_sdk_opt_in` so the SDK opt-in predicate became Grit authority and the overlapping mapgen-core adapter-import predicate defers to `preserve_mapgen_core_runtime_neutrality`.

Completed moves:

- Keep SDK entrypoint opt-in/source-shape authority in the packet, preferably as Grit pattern authority.
- Remove or demote the overlapping mapgen-core `@civ7/adapter/civ7` import ban branch from this packet because `preserve_mapgen_core_runtime_neutrality` now owns it through Grit.
- Convert the residual rule away from `source-check`, delete `require_explicit_mapgen_sdk_opt_in.rule.mjs`, then delete `rule-runtime.policy.mjs`.
- Regenerate execution-surface analytics and prove `source-check` has zero active rules.

## Slice 1: Promote Existing Non-Adapter Patterns Where Runner Ownership Is Clear

Goal: normalize rules that already have pattern authority but are not active source-check adapters, especially where command-check is only duplicating text/source matching.

| Priority | Rule | Lane | Why |
| ---: | --- | --- | --- |
| 1 | `prohibit_product_scan_roots_in_grit_provider` | global-docs-toolkit | Prevents product/domain scan-root literals such as packages, apps, mods, and .civ7 from being hard-coded inside the generic Grit provider. |

## Slice 2: Consolidate Deleted Stale Adapter Rows

Goal: no file deletion remains for the four stale adapters; follow-up work should split or consolidate the command-check records themselves where the matrix marks them mixed.

## Slice 3: Split Broad Command-Check Bundles And Mixed Helpers

Goal: split `needs_split` rows assertion-by-assertion. Port Grit-shaped assertions first; keep generated-output, graph, exact topology, or runtime/package behavior in package-local validators, Nx, or data-driven structural checks.

| Rule | Lane | Split Note |
| --- | --- | --- |
| `block_unapproved_base_standard_boundary_leaks` | platform-resources | Split into: runtime import boundary consolidated into enforce_adapter_only_base_standard_imports Grit authority; allowlisted provenance/test string debt deleted or demoted after confirming it is not runtime import authority. |
| `enforce_domain_refactor_boundary_profile` | mapgen-domain | This is a transitional bundle/profile. Split into dedicated structural rules, demote profile mechanics, and delete duplicates already covered by narrower packets. |
| `enforce_studio_dev_runner_topology` | mapgen-other | Split Nx target/dependency topology toward Nx/project metadata proof, while source-token/file-existence residue can remain Habitat structural or become data-driven. |
| `ensure_docs_checkout_paths_are_portable` | global-docs-toolkit | First-class split candidate: keep pattern authority for the Grit rewrite/check, then demote or delete the advisory command script once the pattern lane owns detection and apply semantics. |
| `preserve_decomposed_foundation_contract_surfaces` | mapgen-domain | Do not convert whole file directly to Grit; first split legacy bans, import allowlists, expected tag/contract presence, and projection currentness. |
| `preserve_morphology_contracts_and_overlay_ownership` | mapgen-domain | Split before acting; current rule mixes cleanup bans, contract-shape currentness, and overlay ownership proof. |
| `preserve_standard_stage_topology_and_path_invariants` | mapgen-pipeline | Do not force the whole rule into Grit. Split retired alias bans from canonical topology/order and stage-directory invariants; the latter wants a small data-driven structural checker or single source manifest. |
| `prohibit_cross_op_runtime_calls` | mapgen-domain | Split source-import authority into Grit and consolidate orchestration-call detection with prohibit_runtime_orchestration_helpers_in_domain_ops. |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | mapgen-pipeline | Category notes already call this a mixed packet; split into at least ecology terminology, scoped runtime RNG/fudge helpers, and legacy official generator surfaces before choosing Grit rows. |
| `require_owned_domain_config_catalog_surfaces` | mapgen-domain | Likely yields at least one Grit rule plus one data-driven exact-surface rule. |
| `require_projection_calls_in_projection_steps` | mapgen-other | Split into Grit candidates for forbidden projection/physics calls and separate structural/topology assertions for required owners/tokens. |
| `require_public_ecology_surfaces_and_retired_topology_removal` | mapgen-domain | Split Grit-able source/retired topology checks from active-root existence/currentness. |
| `require_recipe_dag_contract_metadata` | mapgen-other | Split direct service/contract import rules into Grit or data-driven boundary checks; keep transitive graph closure as a package/local graph validator unless Habitat grows a graph rule engine. |
| `validate_mapgen_docs_anchors_and_references` | global-docs-toolkit | Split text-shape policy from reference-existence validation. Do not port the whole Python script to Grit as one large pattern. |
| `verify_standard_recipe_public_authoring_surface` | mapgen-pipeline | Split topology/stage-id overlap from package-local authoring-model validation. Public schema derivation and focus-path semantics belong with the package validator, not Grit. |

## Slice 4: Non-Grit Cleanup

Goal: move or preserve non-Grit rows in the right owner model: generated/currentness checks to Nx or package validators, file-layer protection to data-driven path rules, runtime/tool smoke checks to package-local validators. Do this now that source-check adapter deletion has removed the confusing execution surface.
