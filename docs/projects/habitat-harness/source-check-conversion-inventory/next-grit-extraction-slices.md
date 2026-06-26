# Next Grit Extraction Slices

Status: updated after command-check split canary

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

## Completed Command-Check Split Canary

Goal completed: run one small vertical split slice before launching a systematic agent
wave. The slice should split mixed `command-check` packets assertion by
assertion, move or delete only the assertions whose owner is clear, and record
the workflow/insights for the broader `needs_split` workstream.

Completed canary set:

| Priority | Rule | Lane | Why |
| ---: | --- | --- | --- |
| 1 | `prohibit_cross_op_runtime_calls` | mapgen-domain | Converted cross-op import/export/dynamic source authority to `grit-check`; deleted duplicated `ops.bind` / `runValidated` command-script detection in favor of `prohibit_runtime_orchestration_helpers_in_domain_ops`. |
| 2 | `require_public_ecology_surfaces_and_retired_topology_removal` | mapgen-domain | Converted source import/export and retired-path predicates to `grit-check`; demoted active-root existence/currentness out of this packet. |
| 3 | `ensure_docs_checkout_paths_are_portable` | global-docs-toolkit | Converted to docs apply-backed `grit-check` diagnostics; preserved advisory severity and intentionally narrowed the old broad heuristic to rewrite-backed findings. |

Do not start with `prohibit_product_scan_roots_in_grit_provider`; it is already
`grit-check` and remains listed in the matrix only as an already-promoted Grit
authority row.

## Completed Command-Check Split Systematic Wave

Goal completed: fan out across the remaining 12 `needs_split` rows with the
same assertion-level process. The wave resolved 7 rows and left 5 durable split
bundles that need their own follow-up.

Completed moves:

- Deleted `block_unapproved_base_standard_boundary_leaks`; its real runtime import boundary is already owned by `enforce_adapter_only_base_standard_imports`.
- Converted `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` to `grit-check`.
- Added `prohibit_misplaced_projection_adapter_calls` as the Grit split from `require_projection_calls_in_projection_steps`.
- Added `prohibit_recipe_dag_runtime_source_dependencies` as the Grit split from `require_recipe_dag_contract_metadata`.
- Retained `preserve_standard_stage_topology_and_path_invariants`, `require_projection_calls_in_projection_steps`, `require_recipe_dag_contract_metadata`, `enforce_studio_dev_runner_topology`, and `verify_standard_recipe_public_authoring_surface` as non-Grit ownership after assertion review.

## Slice 3: Consolidate Deleted Stale Adapter Rows

Goal: no file deletion remains for the four stale adapters; follow-up work should split or consolidate the command-check records themselves where the matrix marks them mixed.

## Slice 4: Remaining Broad Command-Check Bundles And Mixed Helpers

Goal: split the 5 remaining `needs_split` rows assertion-by-assertion. Port Grit-shaped assertions first; keep generated-output, graph, exact topology, or runtime/package behavior in package-local validators, Nx, or data-driven structural checks.

| Rule | Lane | Split Note |
| --- | --- | --- |
| `enforce_domain_refactor_boundary_profile` | mapgen-domain | This is a transitional bundle/profile. Split into dedicated structural rules, demote profile mechanics, and delete duplicates already covered by narrower packets. |
| `preserve_decomposed_foundation_contract_surfaces` | mapgen-domain | Do not convert whole file directly to Grit; first split legacy bans, import allowlists, expected tag/contract presence, and projection currentness. |
| `preserve_morphology_contracts_and_overlay_ownership` | mapgen-domain | Split before acting; current rule mixes cleanup bans, contract-shape currentness, and overlay ownership proof. |
| `require_owned_domain_config_catalog_surfaces` | mapgen-domain | Likely yields at least one Grit rule plus one data-driven exact-surface rule. |
| `validate_mapgen_docs_anchors_and_references` | global-docs-toolkit | Split text-shape policy from reference-existence validation. Do not port the whole Python script to Grit as one large pattern. |

## Slice 5: Non-Grit Cleanup

Goal: move or preserve non-Grit rows in the right owner model: generated/currentness checks to Nx or package validators, file-layer protection to data-driven path rules, runtime/tool smoke checks to package-local validators. Do this now that source-check adapter deletion has removed the confusing execution surface.
