# mapgen-other Lane Inventory

Status: live lane inventory updated after Packet A.2 validator-ownership retirement

Scope: `.habitat/civ7/mapgen/{core,map-output,sdk,studio,visualization}/**`

Rows inspected: 19 historical inventory records, representing 18 live Habitat
rules and one Packet A.2 row retired to a package/Nx owner. The inventory also
includes source-check adapters that have since been deleted, the added
visualization row, and the Domino 38 projection-contract split.

## Summary

| Disposition | Count | Rows |
| --- | ---: | --- |
| `grit_pattern_authority` | 9 | `prohibit_runtime_helper_redeclarations`, `preserve_mapgen_core_runtime_neutrality`, `prohibit_domain_ops_projection_effect_dependencies`, `prohibit_map_projection_dependencies_in_physics_contracts`, `require_standard_recipe_map_effect_name_suffixes`, `require_typed_placement_outcomes_before_apply`, `require_explicit_mapgen_sdk_opt_in`, `require_studio_ui_recipe_artifact_imports`, `enforce_studio_rpc_eventhub_topology` |
| `data_driven_import_path_rule` | 2 | `protect_generated_map_entrypoints_from_hand_edits`, `block_studio_config_leakage_into_shipped_catalog` |
| `package_local_test_or_validator` | 4 | `verify_studio_recipe_artifacts_are_current`, `ensure_studio_worker_bundle_is_browser_safe`, `verify_visualization_runtime_build_artifacts`, `validate_generated_map_entrypoint_contracts` |
| `needs_split` | 3 | `require_projection_calls_in_projection_steps`, `enforce_studio_dev_runner_topology`, `require_recipe_dag_contract_metadata` |
| `needs_projection_contract_surface` | 1 | `prohibit_realized_map_artifact_tags` |
| `delete_or_demote` | 0 | none |

## First Grit Candidates

The cleanest next extraction slice from this lane is the adapter-backed source-check set that already has adjacent Grit authority:

1. `require_typed_placement_outcomes_before_apply`: adapter is almost exactly the existing path-scoped call-expression Grit pattern.
2. `prohibit_domain_ops_projection_effect_dependencies`: adapter string-literal predicate is already represented by the pattern.
3. `require_studio_ui_recipe_artifact_imports`: adapter import-source predicate is already represented by the pattern with server/browser-runner exclusions.
4. `preserve_mapgen_core_runtime_neutrality`: adapter duplicates import, identifier, and text predicates already authored as a pattern.
5. `prohibit_runtime_helper_redeclarations`: adapter duplicates the existing declaration pattern; keep the adjacent apply pattern separate as rewrite authority.

These five rows are the best state-space collapse because converting them deletes source-check adapters without needing package behavior decisions.

The final follow-up split converted `require_explicit_mapgen_sdk_opt_in` to
Grit and deleted the last source-check adapter/runtime. Its SDK opt-in predicate
stays in the SDK packet; the overlapping mapgen-core adapter-import predicate is
owned by `preserve_mapgen_core_runtime_neutrality`.

## Notable Split Candidates

- `require_projection_calls_in_projection_steps`: split forbidden projection/physics call placement into Grit-shaped predicates; keep exact required owner/caller/token assertions separate until a better topology/check model exists.
- `enforce_studio_dev_runner_topology`: split Nx target/dependency topology from source-token/file-existence checks. The Nx ordering part should not become Grit authority.
- `require_recipe_dag_contract_metadata`: split direct import/source bans into Grit or data-driven boundary checks; keep transitive import-graph closure as a graph-aware validator unless Habitat grows a graph rule engine.

## Non-Grit / Later Moves

- `validate_generated_map_entrypoint_contracts` completed that move in Packet
  A.2: its Habitat packet is retired and non-cacheable Nx target
  `mod-swooper-maps:generated:check` owns tracked generated-entrypoint
  currentness after `gen:maps`.
- `verify_studio_recipe_artifacts_are_current` and `verify_visualization_runtime_build_artifacts` are build-artifact currentness checks. Move toward Nx/package target prerequisites.
- `ensure_studio_worker_bundle_is_browser_safe` inspects built dist output. Keep as package-local bundle validation.
- `protect_generated_map_entrypoints_from_hand_edits` is already a simple file-layer generated-zone protection, not an adapter or Grit target.
- `block_studio_config_leakage_into_shipped_catalog` is simple path-scoped artifact text matching; a generic data-driven file-token rule would be cleaner than a bespoke command script.

## Blockers

No lane blocker. The allowed enum does not have a precise `file_layer_generated_zone` or `data_driven_file_text_rule` value, so `protect_generated_map_entrypoints_from_hand_edits` and `block_studio_config_leakage_into_shipped_catalog` are recorded as `data_driven_import_path_rule` with clarifying notes.
