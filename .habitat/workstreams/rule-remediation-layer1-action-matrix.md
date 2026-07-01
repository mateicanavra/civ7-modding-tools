# Rule Remediation Layer 1 Action Matrix

Status: Layer 1 convergence passed; Layer 2 not started

Source commit: `7494dd91354a2d8bf22251dc02ca31f74510be5b`

Branch: `codex/habitat-rule-remediation-frames`

Scope: live Habitat rule corpus, non-mutating Layer 1 classification pass.

Controlling frame: `.habitat/frames/RULE-REMEDIATION-WORKSTREAM-FRAME.md`

Layer method: `.habitat/frames/RULE-ACTION-CLASSIFICATION-FRAME.md`

Purpose: preserve source-backed Layer 1 lane findings so compaction or agent
thread shutdown does not lose important details. This file is an active
workstream record, not a normative method frame and not a Layer 2 packet index.

## Compaction And Inset Preservation

Important insets must be written here before they become operational inputs.
Chat context, subagent thread context, and compaction summaries are not durable
sources of truth for this workstream.

An inset is important when it changes any of the following:

- the active layer, gate, or stop condition;
- the scoped corpus or lane assignment;
- an action decision, blocker, conflict, or pending proof;
- a cross-lane insight that can affect slice selection;
- a user correction that changes the expected rigor, depth, or method;
- a reviewer finding that blocks or conditions closure.

When a new important inset appears, add it to this workstream record or to a
successor durable record before relying on it for the next step. The minimum
durable form is a dated note, the affected rule or lane when applicable, the
source of the inset, and the action it changes or preserves.

Latest preserved user inset: the Layer 1 pass must not be treated as a quick
manifest classification. Fresh agents must use investigation design and a
systematic workstream rhythm, read the actual rules and relevant source/docs,
and only then classify each rule. Layer 2 must not begin until this
source-grounded Layer 1 matrix is complete, reconciled, and reviewed.

## Gate State

Current layer: Layer 1, source-backed action classification.

Current gate: Layer 1 convergence passed.

Mutation authorization: none. No Layer 2 decision packets and no Layer 3
implementation are authorized by this artifact.

Received lanes:

- `blueprints/domain-operation`: 8 rules.
- `blueprints/domain`: 10 rules.
- mixed admitted blueprints outside domain/domain-operation: 9 rules.
- `civ7/mapgen/domains/foundation`: 12 rules.
- `civ7/mapgen/domains` outside foundation: 10 rules.
- `civ7/mapgen/pipeline` config/contracts/cutover/runtime: 9 rules.
- standard recipe top-level rules: 12 rules.
- standard recipe stage rules: foundation/hydrology/map/placement: 10 rules.
- standard recipe morphology stage rules: 10 rules.
- MapGen SDK/core/visualization and mod-sdk: 4 rules.
- MapGen Studio: 8 rules.
- Civ7 platform and resources: 9 rules.
- non-Civ docs/global/workspace/Habitat toolkit: 16 rules.

Pending lanes:

- none.

Layer 1 coverage: 127 of 127 live rules have returned source-backed lane
output. Fresh convergence review passed with no P1/P2 findings.

## Evidence Standard

Lane rows are accepted into this interim record only when they report actual
inspection beyond manifest metadata: rule packet, runner/support/baseline,
path coverage or scan roots, relevant source/docs, and source presence/absence
checks or representative source facts.

Rows that still require deeper semantic decomposition are classified for Layer
1 only. `decision packet needed: yes` means Layer 2 may later produce a packet;
it does not authorize implementation.

## Layer 1 Output Contract Supplement

This supplement completes the fields required by
`.habitat/frames/RULE-REMEDIATION-WORKSTREAM-FRAME.md` without changing the
main action decisions. The main `Action Matrix` remains the compact row list;
this section preserves the additional convergence fields needed for restart,
review, and Layer 2 slice selection.

### Field Resolution

- `Rule id`, `Stable tree area`, `Action decision`, `Decision packet needed`,
  `Expected remediation outcome`, and `Evidence note` are in the main
  `Action Matrix`.
- `Current path` is preserved in `Live Manifest Path Index` below.
- `Lane agent` is preserved in `Lane Agent Map` below.
- `Implementation readiness` and `Next action-class candidate` are resolved
  by `Action Readiness And Next-Class Map` below.
- `Blocker / proof` is resolved by the action-specific blocker map plus any
  row-specific conflicts in `Named Conflict And Blocker Rows`.
- `Confidence`: all rows are accepted as source-backed Layer 1 classifications
  from fresh no-edit lane agents. Confidence is `review-pending` until the
  convergence reviewer accepts this supplement; rows named under conflicts or
  morphology scope retain their explicit blocker even after coverage passes.
- `Conflicts`: default `none surfaced`; exceptions are listed below.
- `Selected / excluded`: no Layer 2 slice is selected yet. Every row is
  excluded from Layer 2 packet work until the Layer 1 convergence gate passes.

### Lane Agent Map

| Stable tree area | Lane agent | Agent id |
| --- | --- | --- |
| `blueprints/domain-operation` | Ohm | `019f1be8-fe97-7943-931d-aef13855f732` |
| `blueprints/domain` | Popper | `019f1be9-3440-7591-a563-cd298561bf38` |
| `mixed blueprints` | Rawls | `019f1be9-5f81-74a3-9b87-44b350f76bf6` |
| `domains/foundation` | Wegener | `019f1be9-95a0-7551-b77e-049843d0e9a7` |
| `domains/nonfoundation` | Nietzsche | `019f1be9-cb3d-7e61-897e-4ddf23733af4` |
| `pipeline config/contracts/runtime` | Turing | `019f1be9-fcde-7bf2-8f07-33beff21f925` |
| `standard recipe top-level` | Carson | `019f1bee-2421-7693-9265-ec2f302a75b8` |
| `standard recipe stage foundation/hydrology/map/placement` | Lovelace | `019f1bee-52ec-7f10-8228-683e52f451ac` |
| `standard recipe morphology stage` | Cicero | `019f1bee-7dd0-7c73-a772-013891b6f618` |
| `MapGen SDK / mod-sdk` | Ptolemy | `019f1bee-9e02-7a90-93f3-543c91bcc95a` |
| `MapGen Studio` | Dirac | `019f1bee-c1b0-7561-8efc-e3e0e1211eaa` |
| `Civ7 platform/resources` | James | `019f1bee-e746-77e2-b2a1-705d413388ab` |
| `non-Civ docs/global/toolkit` | Curie | `019f1bf3-8da1-7071-9529-02ae04ae041b` |

### Action Cluster Counts

| Action decision | Count |
| --- | ---: |
| `no action` | 40 |
| `runtime/source validation` | 29 |
| `boundary inversion` | 18 |
| `closed structure inversion` | 10 |
| `context admission` | 9 |
| `retirement/garbage collection` | 6 |
| `split by owner` | 6 |
| `consolidation/dedup` | 4 |
| `positive authority creation` | 4 |
| `placement/category metadata repair` | 1 |

Packet-needed totals: `yes=77`, `no=50`.

### Action Readiness And Next-Class Map

| Action decision | Implementation readiness | Next action-class candidate |
| --- | --- | --- |
| `no action` | implementation-ready as stay-put after convergence review; no Layer 2 packet selected | none |
| `context admission` | implementation-ready as stay-put/admit-current-context after convergence review; no Layer 2 packet unless reviewer reopens owner proof | none |
| `placement/category metadata repair` | implementation-ready only as a later Layer 3 metadata-repair slice; no Layer 2 packet selected | metadata repair slice candidate |
| `runtime/source validation` | not implementation-ready; requires Layer 2 packet to choose native rail and proof boundary | runtime/source validation packet |
| `boundary inversion` | not implementation-ready; requires Layer 2 packet to define positive boundary/public-surface authority | boundary inversion packet |
| `closed structure inversion` | not implementation-ready; requires Layer 2 packet to define allowed structure authority | closed structure inversion packet |
| `split by owner` | not implementation-ready; requires Layer 2 packet with owner split and new-row/deletion proof | split-by-owner packet |
| `retirement/garbage collection` | not implementation-ready; requires Layer 2 retirement proof and deletion/absorption write set | retirement proof packet |
| `positive authority creation` | not implementation-ready; requires Layer 2 authority plan before implementation | positive authority packet |
| `consolidation/dedup` | not implementation-ready; requires Layer 2 consolidation proof and survivor selection | consolidation/dedup packet |

### Action-Specific Blocker / Proof Map

| Action decision | Blocker / proof preserved for rows with this action |
| --- | --- |
| `runtime/source validation` | prove whether the invariant belongs in source/runtime/package/Nx/generated-output rails and identify the native proof owner before mutation |
| `boundary inversion` | define the allowed boundary, public surface, dependency graph, or import law that absorbs the negative assertion |
| `closed structure inversion` | define the admitted structure/manifest/schema that makes stray-shape bans unnecessary or mechanical |
| `split by owner` | decompose the mixed predicate by owner/proof shape before moving, deleting, or rewriting packets |
| `retirement/garbage collection` | prove the guarded residue is absent or absorbed and that deletion does not remove live authority |
| `positive authority creation` | prove the constructible authority/kind/schema/surface exists or is authorized enough to plan before admitting rules |
| `consolidation/dedup` | select a survivor/native proof and prove the duplicate rule adds no independent authority |
| `placement/category metadata repair` | repair only metadata/process placement in a later mutation slice; predicate remains acceptable |
| `context admission` | no packet by default; reviewer may reopen only if broader inversion pressure makes owner proof insufficient |
| `no action` | no remediation blocker; preserve as live authority unless convergence review finds contradiction |

### Named Conflict And Blocker Rows

| Rule id | Conflict / blocker | Layer 1 handling |
| --- | --- | --- |
| `require_typed_placement_outcomes_before_apply` | terminal placement apply and resource/discovery materialization are distinct owners; split owner packet required before mutation | Keep packet-required classification; no mutation before Layer 2 decision packet. |
| `prohibit_runtime_helper_redeclarations` | source/baseline contradiction found in `compute-shelf-mask`; packet must decide fix, scope, or baseline truth | Keep packet-required classification; no mutation before Layer 2 decision packet. |
| `enforce_studio_dev_runner_topology` | runner support is stale against current Studio dev command; source validation packet must decide native proof rail | Keep packet-required classification; no mutation before Layer 2 decision packet. |
| `prohibit_morphology_hotspot_overlay_publishers` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `prohibit_morphology_overlay_implementation_reads` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `prohibit_morphology_runtime_continent_step_tokens` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `prohibit_morphology_stage_config_bag_imports` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `prohibit_morphology_stage_legacy_effect_gates` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `prohibit_morphology_story_overlay_contract_artifact` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `prohibit_runtime_continent_contract_tokens` | Morphology scope-intent blocker: packet/manifest path coverage says `morphology*`, while runner scan roots or regexes enumerate only selected morphology surfaces and exclude or ambiguity-handle `morphology-shelf`. | Preserve action decision, but require Layer 2 scope-intent resolution before mutation. |
| `require_public_ecology_surfaces_and_retired_topology_removal` | Context-admission no-packet justification: lane judged the row as narrow contextual currentness; broader inversion pressure is recorded but not selected without an admitted cross-domain import-law owner. | Keep no-packet classification unless convergence review reopens owner proof. |
| `prohibit_hydrology_climate_intervention_tokens` | Context-admission no-packet justification: lane judged the row as narrow contextual currentness; broader inversion pressure is recorded but not selected without an admitted cross-domain import-law owner. | Keep no-packet classification unless convergence review reopens owner proof. |
| `prohibit_hydrology_narrative_domain_imports` | Context-admission no-packet justification: lane judged the row as narrow contextual currentness; broader inversion pressure is recorded but not selected without an admitted cross-domain import-law owner. | Keep no-packet classification unless convergence review reopens owner proof. |

### Live Manifest Path Index

| Rule id | Current path |
| --- | --- |
| `prohibit_realized_map_artifact_tags` | `.habitat/blueprints/artifact/prohibit_realized_map_artifact_tags/rule.json` |
| `require_typed_dependency_and_effect_tag_constants` | `.habitat/blueprints/dependency-tag/require_typed_dependency_and_effect_tag_constants/rule.json` |
| `block_adapter_context_imports_from_domain_ops` | `.habitat/blueprints/domain-operation/block_adapter_context_imports_from_domain_ops/rule.json` |
| `block_engine_runtime_imports_from_domain_ops` | `.habitat/blueprints/domain-operation/block_engine_runtime_imports_from_domain_ops/rule.json` |
| `prohibit_cross_op_runtime_calls` | `.habitat/blueprints/domain-operation/prohibit_cross_op_runtime_calls/rule.json` |
| `prohibit_domain_ops_projection_effect_dependencies` | `.habitat/blueprints/domain-operation/prohibit_domain_ops_projection_effect_dependencies/rule.json` |
| `prohibit_rng_callback_state_in_ops` | `.habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops/rule.json` |
| `prohibit_root_config_facade_imports_in_domain_ops` | `.habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops/rule.json` |
| `prohibit_runtime_orchestration_helpers_in_domain_ops` | `.habitat/blueprints/domain-operation/prohibit_runtime_orchestration_helpers_in_domain_ops/rule.json` |
| `require_domain_ops_root_presence` | `.habitat/blueprints/domain-operation/require_domain_ops_root_presence/rule.json` |
| `prohibit_domain_artifacts_modules` | `.habitat/blueprints/domain/prohibit_domain_artifacts_modules/rule.json` |
| `prohibit_domain_entrypoint_self_reexports` | `.habitat/blueprints/domain/prohibit_domain_entrypoint_self_reexports/rule.json` |
| `prohibit_domain_tag_artifact_shim_imports` | `.habitat/blueprints/domain/prohibit_domain_tag_artifact_shim_imports/rule.json` |
| `prohibit_recipe_imports_in_domain_source` | `.habitat/blueprints/domain/prohibit_recipe_imports_in_domain_source/rule.json` |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | `.habitat/blueprints/domain/prohibit_relative_domain_reaches_from_recipes_and_maps/rule.json` |
| `prohibit_retired_domain_root_catalogs` | `.habitat/blueprints/domain/prohibit_retired_domain_root_catalogs/rule.json` |
| `prohibit_unknown_bag_config_usage` | `.habitat/blueprints/domain/prohibit_unknown_bag_config_usage/rule.json` |
| `require_public_domain_surfaces_in_recipes_and_maps` | `.habitat/blueprints/domain/require_public_domain_surfaces_in_recipes_and_maps/rule.json` |
| `require_public_domain_surfaces_in_tests` | `.habitat/blueprints/domain/require_public_domain_surfaces_in_tests/rule.json` |
| `restrict_recipes_to_public_domain_surfaces` | `.habitat/blueprints/domain/restrict_recipes_to_public_domain_surfaces/rule.json` |
| `block_studio_config_leakage_into_shipped_catalog` | `.habitat/blueprints/mod-map/block_studio_config_leakage_into_shipped_catalog/rule.json` |
| `protect_generated_map_entrypoints_from_hand_edits` | `.habitat/blueprints/mod-map/protect_generated_map_entrypoints_from_hand_edits/rule.json` |
| `validate_generated_map_entrypoint_contracts` | `.habitat/blueprints/mod-map/validate_generated_map_entrypoint_contracts/rule.json` |
| `prohibit_sibling_stage_private_step_imports` | `.habitat/blueprints/recipe-stage/prohibit_sibling_stage_private_step_imports/rule.json` |
| `require_shared_visualization_contracts_at_stage_surfaces` | `.habitat/blueprints/recipe-stage/require_shared_visualization_contracts_at_stage_surfaces/rule.json` |
| `require_domain_contract_roots_in_step_contracts` | `.habitat/blueprints/recipe-step/require_domain_contract_roots_in_step_contracts/rule.json` |
| `require_runtime_domain_op_bundle_imports` | `.habitat/blueprints/recipe/require_runtime_domain_op_bundle_imports/rule.json` |
| `validate_ecology_op_contract_quality` | `.habitat/civ7/mapgen/domains/ecology/_remainder/validate_ecology_op_contract_quality/rule.json` |
| `require_ecology_canonical_op_module_topology` | `.habitat/civ7/mapgen/domains/ecology/rules/require_ecology_canonical_op_module_topology/rule.json` |
| `require_public_ecology_surfaces_and_retired_topology_removal` | `.habitat/civ7/mapgen/domains/ecology/rules/require_public_ecology_surfaces_and_retired_topology_removal/rule.json` |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | `.habitat/civ7/mapgen/domains/foundation/_remainder/prohibit_foundation_duplicate_math_helper_redefinitions/rule.json` |
| `preserve_decomposed_foundation_contract_surfaces` | `.habitat/civ7/mapgen/domains/foundation/rules/preserve_decomposed_foundation_contract_surfaces/rule.json` |
| `prohibit_foundation_decomposed_ops_legacy_internal_imports` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_decomposed_ops_legacy_internal_imports/rule.json` |
| `prohibit_foundation_legacy_aggregate_tectonic_op_surface` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonic_op_surface/rule.json` |
| `prohibit_foundation_legacy_aggregate_tectonics` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_aggregate_tectonics/rule.json` |
| `prohibit_foundation_legacy_plate_kinematics` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_legacy_plate_kinematics/rule.json` |
| `prohibit_foundation_op_contract_config_bags` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_op_contract_config_bags/rule.json` |
| `prohibit_foundation_rules_tectonics_shim_reexports` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_rules_tectonics_shim_reexports/rule.json` |
| `prohibit_foundation_strategy_nonlocal_imports` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_strategy_nonlocal_imports/rule.json` |
| `prohibit_legacy_compute_tectonics_token` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_legacy_compute_tectonics_token/rule.json` |
| `prohibit_removed_foundation_profile_config_tokens` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_removed_foundation_profile_config_tokens/rule.json` |
| `prohibit_removed_foundation_wrap_polar_maturity_tokens` | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_removed_foundation_wrap_polar_maturity_tokens/rule.json` |
| `prohibit_hydrology_map_config_key_tokens` | `.habitat/civ7/mapgen/domains/hydrology/_remainder/prohibit_hydrology_map_config_key_tokens/rule.json` |
| `prohibit_hydrology_climate_intervention_tokens` | `.habitat/civ7/mapgen/domains/hydrology/rules/prohibit_hydrology_climate_intervention_tokens/rule.json` |
| `prohibit_hydrology_narrative_domain_imports` | `.habitat/civ7/mapgen/domains/hydrology/rules/prohibit_hydrology_narrative_domain_imports/rule.json` |
| `prohibit_legacy_morphology_config_keys` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_morphology_config_keys/rule.json` |
| `prohibit_legacy_morphology_module_imports` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_morphology_module_imports/rule.json` |
| `require_morphology_config_facade_exports` | `.habitat/civ7/mapgen/domains/morphology/rules/require_morphology_config_facade_exports/rule.json` |
| `require_narrative_hotspot_overlay_owner` | `.habitat/civ7/mapgen/domains/narrative/rules/require_narrative_hotspot_overlay_owner/rule.json` |
| `prohibit_wrapper_only_advanced_config` | `.habitat/civ7/mapgen/pipeline/config/_remainder/prohibit_wrapper_only_advanced_config/rule.json` |
| `prohibit_bare_value_export_all_from_contract_surfaces` | `.habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_bare_value_export_all_from_contract_surfaces/rule.json` |
| `prohibit_empty_object_defaults_in_contract_schemas` | `.habitat/civ7/mapgen/pipeline/contracts/rules/prohibit_empty_object_defaults_in_contract_schemas/rule.json` |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | `.habitat/civ7/mapgen/pipeline/cutover/_remainder/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/rule.json` |
| `prohibit_ambient_rng_in_authored_generation` | `.habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/rule.json` |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | `.habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/rule.json` |
| `prohibit_runtime_local_config_default_merging` | `.habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_runtime_local_config_default_merging/rule.json` |
| `prohibit_runtime_calls_to_runvalidated` | `.habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_calls_to_runvalidated/rule.json` |
| `prohibit_runtime_validation_and_compiler_imports` | `.habitat/civ7/mapgen/pipeline/runtime/rules/prohibit_runtime_validation_and_compiler_imports/rule.json` |
| `preserve_standard_stage_topology_and_path_invariants` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/rule.json` |
| `prohibit_map_projection_dependencies_in_physics_contracts` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_map_projection_dependencies_in_physics_contracts/rule.json` |
| `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names/rule.json` |
| `prohibit_narrative_swatches_stage_token` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_narrative_swatches_stage_token/rule.json` |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_standard_tag_catalog_legacy_morphology_effect_gates/rule.json` |
| `require_full_profile_domain_stage_roots` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_full_profile_domain_stage_roots/rule.json` |
| `require_standard_recipe_map_effect_name_suffixes` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_map_effect_name_suffixes/rule.json` |
| `require_standard_recipe_tag_catalog_owner_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_tag_catalog_owner_tokens/rule.json` |
| `verify_runtime_stage_order_matches_contract_manifest` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest/rule.json` |
| `verify_standard_recipe_artifacts_match_source_stages` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_artifacts_match_source_stages/rule.json` |
| `verify_standard_recipe_declared_stage_keys` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_declared_stage_keys/rule.json` |
| `verify_standard_recipe_public_authoring_surface` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface/rule.json` |
| `prohibit_foundation_projection_legacy_motion_source` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_projection_legacy_motion_source/rule.json` |
| `prohibit_foundation_stage_cast_merge_hacks` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_cast_merge_hacks/rule.json` |
| `prohibit_foundation_stage_sentinel_passthrough` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_sentinel_passthrough/rule.json` |
| `prohibit_foundation_step_contract_config_bags` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_step_contract_config_bags/rule.json` |
| `prohibit_hydrology_runtime_continent_step_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/hydrology/rules/prohibit_hydrology_runtime_continent_step_tokens/rule.json` |
| `prohibit_map_morphology_legacy_plate_driver_dependencies` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_map_morphology_legacy_plate_driver_dependencies/rule.json` |
| `prohibit_migrated_consumer_effect_gating_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_migrated_consumer_effect_gating_tokens/rule.json` |
| `prohibit_misplaced_projection_adapter_calls` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_misplaced_projection_adapter_calls/rule.json` |
| `require_projection_calls_in_projection_steps` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/require_projection_calls_in_projection_steps/rule.json` |
| `preserve_morphology_belt_driver_contracts` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/preserve_morphology_belt_driver_contracts/rule.json` |
| `prohibit_morphology_contract_legacy_plate_driver_dependencies` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_contract_legacy_plate_driver_dependencies/rule.json` |
| `prohibit_morphology_dual_read_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_dual_read_tokens/rule.json` |
| `prohibit_morphology_hotspot_overlay_publishers` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_hotspot_overlay_publishers/rule.json` |
| `prohibit_morphology_overlay_implementation_reads` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_overlay_implementation_reads/rule.json` |
| `prohibit_morphology_runtime_continent_step_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_runtime_continent_step_tokens/rule.json` |
| `prohibit_morphology_stage_config_bag_imports` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_config_bag_imports/rule.json` |
| `prohibit_morphology_stage_legacy_effect_gates` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_legacy_effect_gates/rule.json` |
| `prohibit_morphology_story_overlay_contract_artifact` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_story_overlay_contract_artifact/rule.json` |
| `prohibit_runtime_continent_contract_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_runtime_continent_contract_tokens/rule.json` |
| `require_typed_placement_outcomes_before_apply` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/placement/rules/require_typed_placement_outcomes_before_apply/rule.json` |
| `preserve_mapgen_core_runtime_neutrality` | `.habitat/civ7/mapgen/sdk/core/rules/preserve_mapgen_core_runtime_neutrality/rule.json` |
| `prohibit_runtime_helper_redeclarations` | `.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json` |
| `verify_visualization_runtime_build_artifacts` | `.habitat/civ7/mapgen/sdk/visualization/rules/verify_visualization_runtime_build_artifacts/rule.json` |
| `ensure_studio_worker_bundle_is_browser_safe` | `.habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe/rule.json` |
| `enforce_studio_dev_runner_topology` | `.habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology/rule.json` |
| `prohibit_retired_studio_devlive_daemon_file` | `.habitat/civ7/mapgen/studio/devops/rules/prohibit_retired_studio_devlive_daemon_file/rule.json` |
| `prohibit_recipe_dag_runtime_source_dependencies` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies/rule.json` |
| `require_recipe_dag_contract_metadata` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata/rule.json` |
| `require_studio_ui_recipe_artifact_imports` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports/rule.json` |
| `enforce_studio_rpc_eventhub_topology` | `.habitat/civ7/mapgen/studio/server/rules/enforce_studio_rpc_eventhub_topology/rule.json` |
| `prohibit_studio_rpc_eventhub_lifecycle_leaks` | `.habitat/civ7/mapgen/studio/server/rules/prohibit_studio_rpc_eventhub_lifecycle_leaks/rule.json` |
| `require_explicit_mapgen_sdk_opt_in` | `.habitat/civ7/mod-sdk/rules/require_explicit_mapgen_sdk_opt_in/rule.json` |
| `enforce_adapter_only_base_standard_imports` | `.habitat/civ7/platform/adapter/rules/enforce_adapter_only_base_standard_imports/rule.json` |
| `prohibit_adapter_local_legacy_generator_logic` | `.habitat/civ7/platform/adapter/rules/prohibit_adapter_local_legacy_generator_logic/rule.json` |
| `preserve_transport_pure_orpc_contracts` | `.habitat/civ7/platform/control-orpc/rules/preserve_transport_pure_orpc_contracts/rule.json` |
| `require_sanctioned_direct_control_session_owners` | `.habitat/civ7/platform/direct-control/session/rules/require_sanctioned_direct_control_session_owners/rule.json` |
| `require_narrow_game_ui_bridge_bootstrap` | `.habitat/civ7/platform/game-ui-bridge/rules/require_narrow_game_ui_bridge_bootstrap/rule.json` |
| `block_hand_edits_to_generated_civ7_types` | `.habitat/civ7/resources/civ7-types/rules/block_hand_edits_to_generated_civ7_types/rule.json` |
| `block_hand_edits_to_generated_map_policy_tables` | `.habitat/civ7/resources/map-policy/rules/block_hand_edits_to_generated_map_policy_tables/rule.json` |
| `ensure_map_policy_dependency_independence` | `.habitat/civ7/resources/map-policy/rules/ensure_map_policy_dependency_independence/rule.json` |
| `preserve_evidence_provenance_labels` | `.habitat/civ7/resources/map-policy/rules/preserve_evidence_provenance_labels/rule.json` |
| `require_docs_site_root_inputs` | `.habitat/docs/_blueprints/docs-site/require_docs_site_root_inputs/rule.json` |
| `validate_docs_site_config_inputs` | `.habitat/docs/_blueprints/docs-site/validate_docs_site_config_inputs/rule.json` |
| `verify_docs_site_link_integrity` | `.habitat/docs/_blueprints/docs-site/verify_docs_site_link_integrity/rule.json` |
| `require_mapgen_doc_ground_truth_anchors_heading` | `.habitat/docs/_blueprints/mapgen-canonical-docs/require_mapgen_doc_ground_truth_anchors_heading/rule.json` |
| `require_mapgen_doc_mini_toc_shape` | `.habitat/docs/_blueprints/mapgen-canonical-docs/require_mapgen_doc_mini_toc_shape/rule.json` |
| `validate_mapgen_docs_anchors_and_references` | `.habitat/docs/_blueprints/mapgen-canonical-docs/validate_mapgen_docs_anchors_and_references/rule.json` |
| `ensure_docs_checkout_paths_are_portable` | `.habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json` |
| `enforce_workspace_import_boundaries` | `.habitat/global/workspace/_blueprints/project-boundary-model/enforce_workspace_import_boundaries/rule.json` |
| `validate_boundary_taxonomy_against_workspace_graph` | `.habitat/global/workspace/_blueprints/project-boundary-model/validate_boundary_taxonomy_against_workspace_graph/rule.json` |
| `enforce_formatting_and_import_hygiene` | `.habitat/global/workspace/rules/enforce_formatting_and_import_hygiene/rule.json` |
| `prohibit_pnpm_files_in_bun_workspace` | `.habitat/global/workspace/rules/prohibit_pnpm_files_in_bun_workspace/rule.json` |
| `require_owner_workflow_for_host_protected_surfaces` | `.habitat/global/workspace/rules/require_owner_workflow_for_host_protected_surfaces/rule.json` |
| `verify_habitat_cli_smoke_contract` | `.habitat/habitat/toolkit/_blueprints/cli/verify_habitat_cli_smoke_contract/rule.json` |
| `prohibit_product_scan_roots_in_grit_provider` | `.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/rule.json` |
| `validate_habitat_service_module_file_shape` | `.habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_file_shape/rule.json` |
| `validate_habitat_service_module_root_topology` | `.habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_root_topology/rule.json` |

## Layer 1 Convergence Review

Reviewer: Hooke (`019f1bfe-8839-7530-84e3-49416ab39445`)

Verdict: `PASS WITH NON-BLOCKING NOTES`

Blocking findings: none.

Coverage proof recorded by reviewer:

- Source commit matched artifact commit:
  `7494dd91354a2d8bf22251dc02ca31f74510be5b`.
- Live corpus count: 127 `.habitat/**/rule.json` manifests.
- Main `Action Matrix`: 127 rows, no missing live ids, no stale ids, no
  duplicates.
- `Live Manifest Path Index`: 127 rows, no missing live paths, no stale paths,
  no duplicates.
- Action vocabulary matched
  `.habitat/frames/RULE-ACTION-CLASSIFICATION-FRAME.md`.
- Action totals matched the artifact:
  `no action=40`, `runtime/source validation=29`,
  `boundary inversion=18`, `closed structure inversion=10`,
  `context admission=9`, `retirement/garbage collection=6`,
  `split by owner=6`, `consolidation/dedup=4`,
  `positive authority creation=4`, and
  `placement/category metadata repair=1`.
- Packet totals matched the artifact: `yes=77`, `no=50`.

Non-blocking reviewer note resolved here: this artifact was untracked at review
time and has since been committed through Graphite as the durable Layer 1
record.

Closure recommendation: Layer 1 is closed. The next legal action is Layer 2
action-class selection from this matrix. Layer 2 packets remain unauthorized
until that selection is explicit.

## Action Matrix

| Rule id | Lane | Action decision | Packet? | Expected remediation / state | Evidence note |
| --- | --- | --- | --- | --- | --- |
| `block_adapter_context_imports_from_domain_ops` | `blueprints/domain-operation` | `no action` | no | Stay live in domain-operation boundary. | Source search found adapter/runtime outside ops; Habitat check passed. |
| `block_engine_runtime_imports_from_domain_ops` | `blueprints/domain-operation` | `no action` | no | Stay live in domain-operation boundary. | Engine runtime values absent from ops; Habitat check passed. |
| `prohibit_cross_op_runtime_calls` | `blueprints/domain-operation` | `no action` | no | Stay live as op atomicity guard. | Op entrypoints create one op from local contract/strategy; no sibling/barrel imports. |
| `prohibit_domain_ops_projection_effect_dependencies` | `blueprints/domain-operation` | `no action` | no | Stay live as truth/projection boundary. | `artifact:map.*` and `effect:map.*` appear in projection contexts, not domain ops. |
| `prohibit_rng_callback_state_in_ops` | `blueprints/domain-operation` | `runtime/source validation` | yes | Retarget or narrow to op contract/input validation for ambient RNG state. | Invariant is live, but source has allowed deterministic internal RNG helpers; current predicate is too lexical. |
| `prohibit_root_config_facade_imports_in_domain_ops` | `blueprints/domain-operation` | `no action` | no | Stay live as config-boundary guard. | Root config facade is recipe-facing; no governed op matches. |
| `prohibit_runtime_orchestration_helpers_in_domain_ops` | `blueprints/domain-operation` | `no action` | no | Stay live as op-entrypoint orchestration guard. | `runValidated` exists as API but is not called from op entrypoints. |
| `require_domain_ops_root_presence` | `blueprints/domain-operation` | `no action` | no | Stay live as structure authority. | All expected domain `ops` roots exist. |
| `prohibit_domain_artifacts_modules` | `blueprints/domain` | `no action` | no | Stay as domain topology guard. | No `artifacts.ts`; positive layout is `artifacts/contract/<artifact>.contract.ts`. |
| `prohibit_domain_entrypoint_self_reexports` | `blueprints/domain` | `no action` | no | Stay as entrypoint boundary guard. | Domain entrypoints use relative local exports/imports; Habitat check passed. |
| `prohibit_domain_tag_artifact_shim_imports` | `blueprints/domain` | `retirement/garbage collection` | yes | Delete if no consumers/export docs exist. | Guards retired `@mapgen/domain/tags` and `@mapgen/domain/artifacts` shim names. |
| `prohibit_recipe_imports_in_domain_source` | `blueprints/domain` | `no action` | no | Stay as reverse-dependency guard. | Domain must not import recipe modules; source search clean. |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | `blueprints/domain` | `boundary inversion` | yes | Fold into positive G4 allowed import matrix. | One negative slice of recipe/map public-surface import policy. |
| `prohibit_retired_domain_root_catalogs` | `blueprints/domain` | `no action` | no | Stay as G2 root-catalog guard. | No root `tags.ts` / `artifacts.ts`; guardrail docs name this cleanup. |
| `prohibit_unknown_bag_config_usage` | `blueprints/domain` | `no action` | no | Stay as domain config contract guard. | `UnknownRecord` remains only in core/spec/archive contexts, not domain source. |
| `require_public_domain_surfaces_in_recipes_and_maps` | `blueprints/domain` | `boundary inversion` | yes | Fold into positive G4 allowed import matrix. | Deep-internal import guard; runner/manual-scan qualification needed. |
| `require_public_domain_surfaces_in_tests` | `blueprints/domain` | `split by owner` | yes | Separate public-contract tests from focused internal tests. | Script scope is narrower than manifest wording; tests have legitimate internal contexts. |
| `restrict_recipes_to_public_domain_surfaces` | `blueprints/domain` | `boundary inversion` | yes | Fold into positive G4 allowed import matrix. | Complement to deep/relative recipe guards. |
| `prohibit_realized_map_artifact_tags` | mixed blueprints | `no action` | no | Stay in artifact namespace authority. | No `artifact:map.realized.` hits; valid map artifacts use specific projection/evidence names. |
| `require_typed_dependency_and_effect_tag_constants` | mixed blueprints | `no action` | no | Stay in dependency-tag vocabulary authority. | Step contracts use typed constants; no top-level string tags found. |
| `block_studio_config_leakage_into_shipped_catalog` | mixed blueprints | `runtime/source validation` | yes | Choose generator/package/data rail for shipped catalog hygiene. | Rule reads generated output; generated output proves generation, not policy. |
| `protect_generated_map_entrypoints_from_hand_edits` | mixed blueprints | `no action` | no | Stay as generated-zone guard. | Generated files carry headers and are recreated by generator. |
| `validate_generated_map_entrypoint_contracts` | mixed blueprints | `runtime/source validation` | yes | Move toward generator/package-local validation or Nx freshness. | Current check validates generated entrypoints against canonical configs and hashes. |
| `prohibit_sibling_stage_private_step_imports` | mixed blueprints | `no action` | no | Stay as recipe-stage boundary. | Architecture packet G5 backs no sibling private `steps/` imports. |
| `require_shared_visualization_contracts_at_stage_surfaces` | mixed blueprints | `no action` | no | Stay as recipe-stage visualization surface boundary. | Canonical visualization docs name stage `viz.ts` surfaces. |
| `require_domain_contract_roots_in_step_contracts` | mixed blueprints | `no action` | no | Stay as recipe-step domain public surface guard. | Representative contracts import domain roots; no bad deep imports found. |
| `require_runtime_domain_op_bundle_imports` | mixed blueprints | `no action` | no | Stay as recipe runtime op registry guard. | `recipe.ts` imports domain `/ops` bundles and passes them to compile ops. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | domains/foundation | `positive authority creation` | yes | Define helper authority, then retire/admit the negative proxy. | Canonical helpers exist in `lib/tectonics/shared.ts`; no positive helper/import surface is named. |
| `preserve_decomposed_foundation_contract_surfaces` | domains/foundation | `runtime/source validation` | yes | Collapse exact-string checks into native contract/source validation. | Script checks focused op names, artifact tags, local rules imports, and projection strings. |
| `prohibit_foundation_decomposed_ops_legacy_internal_imports` | domains/foundation | `boundary inversion` | yes | Replace retired internal-path bans with allowed public/import surface. | Forbids imports from retired `compute-tectonic-history` internals. |
| `prohibit_foundation_legacy_aggregate_tectonic_op_surface` | domains/foundation | `closed structure inversion` | yes | Replace token ban with allowed op registry structure. | Current `ops/contracts.ts` and `ops/index.ts` enumerate focused ops. |
| `prohibit_foundation_legacy_aggregate_tectonics` | domains/foundation | `closed structure inversion` | yes | Replace aggregate-token guard with allowed tectonics step/op structure. | Focused tectonic ops are current source/docs target. |
| `prohibit_foundation_legacy_plate_kinematics` | domains/foundation | `closed structure inversion` | yes | Encode allowed schema split between graph/metadata and motion. | `compute-plate-graph` and `compute-plate-motion` now split responsibilities. |
| `prohibit_foundation_op_contract_config_bags` | domains/foundation | `boundary inversion` | yes | Define allowed import/schema boundary for foundation op contracts. | Current rule bans one root config token; broader boundary is the durable target. |
| `prohibit_foundation_rules_tectonics_shim_reexports` | domains/foundation | `boundary inversion` | yes | Define or retain foundation-local allowed rules export surface. | Operation-internal rules-surface governance; do not promote to generic kind without proof. |
| `prohibit_foundation_strategy_nonlocal_imports` | domains/foundation | `boundary inversion` | yes | Keep as foundation operation-internal strategy locality unless a real strategy kind is admitted later. | Evidence did not justify standalone `domain-operation-strategy` yet. |
| `prohibit_legacy_compute_tectonics_token` | domains/foundation | `closed structure inversion` | yes | Absorb into allowed op/stage structure. | Focused op list makes `computeTectonics` obsolete. |
| `prohibit_removed_foundation_profile_config_tokens` | domains/foundation | `runtime/source validation` | yes | Replace lexical ban with native map/config schema validation. | Tokens absent from live source and appear only in archive material. |
| `prohibit_removed_foundation_wrap_polar_maturity_tokens` | domains/foundation | `runtime/source validation` | yes | Replace lexical ban with native allowed config/contract validation. | Successor concepts exist under different schema names, making raw token bans brittle. |
| `validate_ecology_op_contract_quality` | domains/nonfoundation | `positive authority creation` | yes | Keep in `_remainder` until general domain-operation contract-quality authority exists. | Script checks Ecology op descriptions/JSDoc but carries stale `stages/ecology/steps` coverage. |
| `require_ecology_canonical_op_module_topology` | domains/nonfoundation | `context admission` | no | Admit as Ecology contextual structure rule. | Current Ecology ops match canonical module topology. |
| `require_public_ecology_surfaces_and_retired_topology_removal` | domains/nonfoundation | `context admission` | no | Admit as Ecology migration cleanup and public-surface rule. | Active Ecology stages import public surfaces; retired feature-family dirs absent. |
| `prohibit_hydrology_map_config_key_tokens` | domains/nonfoundation | `runtime/source validation` | yes | Move toward native schema/config validation. | Grit scans TS only; actual JSON configs include valid `lakes` config. |
| `prohibit_hydrology_climate_intervention_tokens` | domains/nonfoundation | `context admission` | no | Admit as Hydrology-vs-narrative boundary currentness. | No `climate.swatches` / `climate.story` hits in scoped source. |
| `prohibit_hydrology_narrative_domain_imports` | domains/nonfoundation | `context admission` | no | Admit as Hydrology contextual boundary unless broader import-law owner is admitted. | No narrative domain imports in Hydrology source/stages. |
| `prohibit_legacy_morphology_config_keys` | domains/nonfoundation | `runtime/source validation` | yes | Move toward canonical config/schema rejection of stale keys. | Current Grit scan misses JSON input surface; TS scan passes. |
| `prohibit_legacy_morphology_module_imports` | domains/nonfoundation | `boundary inversion` | yes | Replace retired-path negative guard with allowed import/public-surface matrix. | Current source uses public morphology surfaces or `/ops`. |
| `require_morphology_config_facade_exports` | domains/nonfoundation | `context admission` | no | Admit as morphology config facade surface rule. | Script asserts exact exports and current source matches. |
| `require_narrative_hotspot_overlay_owner` | domains/nonfoundation | `context admission` | no | Admit current overlay-owner rule with naming uncertainty recorded. | Source publisher is only `domain/narrative/tagging/hotspots.ts`; docs call Narrative legacy/gameplay-absorbed. |
| `prohibit_wrapper_only_advanced_config` | pipeline config/contracts/runtime | `closed structure inversion` | yes | Replace token ban with canonical map/recipe config structure. | Docs say flat config and no persisted `advanced`; source scan found no `advanced:` keys. |
| `prohibit_bare_value_export_all_from_contract_surfaces` | pipeline config/contracts/runtime | `no action` | no | Admit in contracts child lane. | No forbidden value `export *`; `export type *` remains allowed. |
| `prohibit_empty_object_defaults_in_contract_schemas` | pipeline config/contracts/runtime | `no action` | no | Admit in contracts child lane. | No `default: {}` in contract schemas; representative contracts use property defaults. |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | pipeline config/contracts/runtime | `retirement/garbage collection` | yes | Delete after source absence/no-consumer proof. | Fresh script passed; no shim/dual/legacy stage alias residue in live roots. |
| `prohibit_ambient_rng_in_authored_generation` | pipeline config/contracts/runtime | `positive authority creation` | yes | Define deterministic authored-generation authority plus exception policy. | One deliberate official-discovery generator exception exists and is exempted by script. |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | pipeline config/contracts/runtime | `split by owner` | yes | Split deterministic-generation, lexical cleanup, owner-specific generator, and projection/runtime clauses. | Predicate mixes multiple owners despite clean branch-level source checks. |
| `prohibit_runtime_local_config_default_merging` | pipeline config/contracts/runtime | `runtime/source validation` | yes | Replace/back with native compile/schema validation after handler scope narrows. | Source scan found no runtime-local `?? {}` or `Value.Default`; defaults belong to compilation. |
| `prohibit_runtime_calls_to_runvalidated` | pipeline config/contracts/runtime | `no action` | no | Admit in runtime child lane. | No `runValidated(...)` in scoped runtime surfaces. |
| `prohibit_runtime_validation_and_compiler_imports` | pipeline config/contracts/runtime | `no action` | no | Admit in runtime child lane. | No TypeBox/compiler validation imports in scoped runtime surfaces. |
| `preserve_standard_stage_topology_and_path_invariants` | standard recipe top-level | `closed structure inversion` | yes | Derive topology authority from recipe/contract manifest plus allowed shared dirs. | Current structure list preserves transitional hubs that target packet says should dissolve. |
| `prohibit_map_projection_dependencies_in_physics_contracts` | standard recipe top-level | `runtime/source validation` | yes | Move to mod/package contract guard or graph validation. | Truth/projection policy and native tests already assert physics must not depend on projection. |
| `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | standard recipe top-level | `context admission` | no | Admit as G1-backed tag catalog naming cleanup. | Guardrail docs explicitly back this cleanup. |
| `prohibit_narrative_swatches_stage_token` | standard recipe top-level | `retirement/garbage collection` | yes | Delete or absorb into positive topology authority. | Current recipe/manifest has no narrative stage; topology authority should cover stage sets. |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | standard recipe top-level | `positive authority creation` | yes | Define allowed tag/effect family authority, then delete guard. | Negative proxy for allowed effect family source. |
| `require_full_profile_domain_stage_roots` | standard recipe top-level | `retirement/garbage collection` | yes | Retire if absorbed by topology/manifest authority. | Preserves transitional profile composition and overlaps broader topology rule. |
| `require_standard_recipe_map_effect_name_suffixes` | standard recipe top-level | `runtime/source validation` | yes | Move to tag constructor/test or dependency-tag policy rail. | Native map-stamping test validates same naming convention. |
| `require_standard_recipe_tag_catalog_owner_tokens` | standard recipe top-level | `split by owner` | yes | Split field, engine, map projection, and placement product tag ownership. | Current script checks only three tokens while catalog has multiple families. |
| `verify_runtime_stage_order_matches_contract_manifest` | standard recipe top-level | `no action` | no | Admit as contextual manifest/source parity. | `orderStandardStages` already makes manifest the runtime order constructor. |
| `verify_standard_recipe_artifacts_match_source_stages` | standard recipe top-level | `consolidation/dedup` | yes | Consolidate with package artifact guard/build validation. | Native test covers source-vs-generated parity. |
| `verify_standard_recipe_declared_stage_keys` | standard recipe top-level | `consolidation/dedup` | yes | Consolidate with contract-manifest parity rule. | Hard-coded textual parser likely duplicates stronger manifest parity. |
| `verify_standard_recipe_public_authoring_surface` | standard recipe top-level | `consolidation/dedup` | yes | Consolidate with native authoring-surface guard or positive public-surface manifest. | Native test is near-equivalent; source derives authoring schema. |
| `prohibit_foundation_projection_legacy_motion_source` | standard recipe stage foundation/hydrology/map/placement | `runtime/source validation` | yes | Move from legacy-token absence to native source/type validation of projection contract. | Source consumes `foundationPlateMotion`, `foundationTectonics`, and history artifacts through projection contract. |
| `prohibit_foundation_stage_cast_merge_hacks` | standard recipe stage foundation/hydrology/map/placement | `closed structure inversion` | yes | Replace wrapper-era cast/spread fallback bans with allowed stage-surface shape. | D1 flat config target and current explicit `public`/`knobsSchema`/`compile` shapes support this. |
| `prohibit_foundation_stage_sentinel_passthrough` | standard recipe stage foundation/hydrology/map/placement | `closed structure inversion` | yes | Replace retired Studio sentinel token checks with closed allowed stage config/public metadata shape. | Same stage authoring surface owner as cast/merge hacks. |
| `prohibit_foundation_step_contract_config_bags` | standard recipe stage foundation/hydrology/map/placement | `boundary inversion` | yes | Define allowed foundation step contract import/config boundary. | Step contracts use op-specific schemas/artifacts, not root config bags. |
| `prohibit_hydrology_runtime_continent_step_tokens` | standard recipe stage foundation/hydrology/map/placement | `boundary inversion` | yes | Define allowed Hydrology-vs-placement boundary graph. | Hydrology owns water-cycle truth; placement owns landmass-region projection and region slots. |
| `prohibit_map_morphology_legacy_plate_driver_dependencies` | standard recipe stage foundation/hydrology/map/placement | `boundary inversion` | yes | Define allowed Morphology projection dependencies. | `plotMountains` consumes morphology artifacts/topography, not Foundation plate drivers. |
| `prohibit_migrated_consumer_effect_gating_tokens` | standard recipe stage foundation/hydrology/map/placement | `boundary inversion` | yes | Define allowed lake projection dependencies/effects. | D2 says Hydrology lake truth projects through `map-hydrology`; retired engine/morphology gates are stale. |
| `prohibit_misplaced_projection_adapter_calls` | standard recipe stage foundation/hydrology/map/placement | `boundary inversion` | yes | Define allowed projection/materialization call owners. | Adapter projection calls belong only in exact owning `map-*` projection steps. |
| `require_projection_calls_in_projection_steps` | standard recipe stage foundation/hydrology/map/placement | `runtime/source validation` | yes | Move token-level positive check to source/runtime validation of projection behavior/contracts. | Script asserts exact callsite tokens and `plotRivers` metadata. |
| `require_typed_placement_outcomes_before_apply` | standard recipe stage foundation/hydrology/map/placement | `split by owner` | yes | Split terminal `placement/apply` from resource/discovery materialization authority. | Terminal apply consumes typed summaries, but discovery materialization still calls official generator; product policy needs separate decision. |
| `preserve_morphology_belt_driver_contracts` | standard recipe morphology stage | `no action` | no | Stay live as morphology stage contract authority until generated manifests can prove it natively. | `artifact:morphology.beltDrivers` is canonical derived belt-driver truth. |
| `prohibit_morphology_contract_legacy_plate_driver_dependencies` | standard recipe morphology stage | `closed structure inversion` | yes | Replace token bans with allowed contract-dependency structure. | Live contracts use crust/history/provenance and `morphologyArtifacts.beltDrivers`. |
| `prohibit_morphology_dual_read_tokens` | standard recipe morphology stage | `retirement/garbage collection` | yes | Retire after confirming no active dual-read migration authority remains. | Scans only `morphology-coasts/steps`; no live source hits outside the rule packet. |
| `prohibit_morphology_hotspot_overlay_publishers` | standard recipe morphology stage | `boundary inversion` | yes | Replace morphology-negative publisher bans with allowed story-overlay publisher ownership. | Live HOTSPOTS publishing is in narrative source; morphology is a false owner. |
| `prohibit_morphology_overlay_implementation_reads` | standard recipe morphology stage | `boundary inversion` | yes | Model allowed overlay consumption surfaces instead of per-stage negative reads. | Forbids `overlays.js` imports and `readOverlay()` in non-contract morphology implementations. |
| `prohibit_morphology_runtime_continent_step_tokens` | standard recipe morphology stage | `runtime/source validation` | yes | Validate allowed runtime/projection owners for continent/region runtime tokens. | Morphology source has no runtime continent tokens; placement/adapter legitimately own runtime region IDs. |
| `prohibit_morphology_stage_config_bag_imports` | standard recipe morphology stage | `boundary inversion` | yes | Define allowed recipe stage config import surface. | Live morphology stages import sanctioned `@mapgen/domain/morphology/config.js`; generic config bags are false surface. |
| `prohibit_morphology_stage_legacy_effect_gates` | standard recipe morphology stage | `runtime/source validation` | yes | Move retired effect-gate token validation to source/tag rail. | Old engine gates appear in older spec/adapter contexts; current projection tags are `effect:map.*`. |
| `prohibit_morphology_story_overlay_contract_artifact` | standard recipe morphology stage | `boundary inversion` | yes | Define allowed artifact dependency graph for morphology contracts and narrative overlays. | Forbids `artifact:storyOverlays` in morphology contracts; narrative owns story overlays. |
| `prohibit_runtime_continent_contract_tokens` | standard recipe morphology stage | `runtime/source validation` | yes | Validate contract-file prohibition with runtime/projection allowlists. | Runtime continent identifiers are forbidden in morphology contracts/artifacts but legitimate elsewhere. |
| `preserve_mapgen_core_runtime_neutrality` | MapGen SDK / mod-sdk | `no action` | no | Stay as MapGen core runtime-neutrality guard. | `packages/mapgen-core/src` remains pure TS; no clear in-scope runtime value leak. |
| `prohibit_runtime_helper_redeclarations` | MapGen SDK / mod-sdk | `runtime/source validation` | yes | Resolve source/baseline contradiction before mutation. | Source inspection found an in-scope helper redeclaration in `compute-shelf-mask`; decide fix, baseline, or scope. |
| `verify_visualization_runtime_build_artifacts` | MapGen SDK / mod-sdk | `runtime/source validation` | yes | Move toward native package/Nx validation or target prerequisite proof. | Current Habitat check is a read-only currentness proxy over required dist files. |
| `require_explicit_mapgen_sdk_opt_in` | MapGen SDK / mod-sdk | `no action` | no | Stay as root mod-sdk public SDK contract. | Corrected taxonomy holds: root mod-sdk is distinct from MapGen SDK children. |
| `ensure_studio_worker_bundle_is_browser_safe` | MapGen Studio | `runtime/source validation` | yes | Move toward build/bundle validation over source/generated output. | Current check reads generated `dist`; ADR/docs support browser-safe worker boundary. |
| `enforce_studio_dev_runner_topology` | MapGen Studio | `runtime/source validation` | yes | Repair stale runner support and validate Nx/project source semantics. | Direct runner rejects current required `bun --conditions bun-source --watch ...` command. |
| `prohibit_retired_studio_devlive_daemon_file` | MapGen Studio | `retirement/garbage collection` | yes | Retire one-file cleanup residue. | Structure rule only forbids retired `devLive.ts`; broader dev topology owns current daemon shape. |
| `prohibit_recipe_dag_runtime_source_dependencies` | MapGen Studio | `consolidation/dedup` | yes | Consolidate with graph-aware Recipe-DAG contract metadata rule. | Narrow direct-token guard overlaps stronger contract-only invariant. |
| `require_recipe_dag_contract_metadata` | MapGen Studio | `context admission` | no | Admit as Recipe-DAG operating-area authority. | Runner passed; source routes through `studio-contracts` and `contract-manifest`. |
| `require_studio_ui_recipe_artifact_imports` | MapGen Studio | `placement/category metadata repair` | no | Repair ownership metadata while keeping predicate. | Predicate is valid UI artifact boundary, but manifest `ownerProject` is `habitat`. |
| `enforce_studio_rpc_eventhub_topology` | MapGen Studio | `runtime/source validation` | yes | Move to source/package test validating server contract. | Native tests assert one `/rpc` mount across studio/civ7/recipeDag. |
| `prohibit_studio_rpc_eventhub_lifecycle_leaks` | MapGen Studio | `runtime/source validation` | yes | Move to native EventHub lifecycle invariant. | Package test already asserts runtime-owned EventHub and no daemon/context leakage. |
| `enforce_adapter_only_base_standard_imports` | Civ7 platform/resources | `no action` | no | Stay as Civ7 adapter `/base-standard/**` import ownership guard. | Nx owns project-plane edges; Grit/Habitat owns virtual `/base-standard/` text imports. |
| `prohibit_adapter_local_legacy_generator_logic` | Civ7 platform/resources | `context admission` | no | Admit as adapter thin-runtime boundary cleanup guard. | Adapter runner scans source for RNG/fudge/legacy generator tokens; baseline empty. |
| `preserve_transport_pure_orpc_contracts` | Civ7 platform/resources | `no action` | no | Stay as control-oRPC contract source-surface guard. | Graph cannot express schema export privacy; rule matches package contract boundary. |
| `require_sanctioned_direct_control_session_owners` | Civ7 platform/resources | `no action` | no | Stay as direct-control session lifecycle ownership guard. | Sanctioned constructors are direct-control session and Studio `Civ7TunerSession`. |
| `require_narrow_game_ui_bridge_bootstrap` | Civ7 platform/resources | `no action` | no | Stay as game UI bridge bootstrap surface guard. | Static source scan is the current Habitat-owned proof surface. |
| `block_hand_edits_to_generated_civ7_types` | Civ7 platform/resources | `no action` | no | Stay as generated Civ7 types file-layer guard. | Generated-zone declaration and resource workflow docs support guard. |
| `block_hand_edits_to_generated_map_policy_tables` | Civ7 platform/resources | `no action` | no | Stay as map-policy generated table file-layer guard. | Generated-zone declaration and map-policy verify command support guard. |
| `ensure_map_policy_dependency_independence` | Civ7 platform/resources | `split by owner` | yes | Split project-boundary graph from virtual `/base-standard/` source import token guard. | `kind:foundation` graph covers project edges, but script also owns source text predicate. |
| `preserve_evidence_provenance_labels` | Civ7 platform/resources | `runtime/source validation` | yes | Move/align with package verifier generated-output equivalence. | Package verifier generates and byte-compares table header containing `Source evidence:`. |
| `require_docs_site_root_inputs` | non-Civ docs/global/toolkit | `no action` | no | Stay as docs-site structure rule. | Structure TOML positively requires docs app root inputs and files exist. |
| `validate_docs_site_config_inputs` | non-Civ docs/global/toolkit | `runtime/source validation` | yes | Route or keep as native docs config validation. | Bun script parses `apps/docs/docs.json` for Mintlify-shaped inputs. |
| `verify_docs_site_link_integrity` | non-Civ docs/global/toolkit | `runtime/source validation` | yes | Keep as docs-site native validation surface. | Runner shells to Mintlify `broken-links` over copied docs-site inputs/assets. |
| `require_mapgen_doc_ground_truth_anchors_heading` | non-Civ docs/global/toolkit | `no action` | no | Stay as MapGen canonical docs shape rule. | Hidden Civ/MapGen owner is docs authority, not runtime; Grit excludes legacy routers. |
| `require_mapgen_doc_mini_toc_shape` | non-Civ docs/global/toolkit | `no action` | no | Stay as MapGen canonical docs shape rule. | Canonical docs already follow `<toc>` spine. |
| `validate_mapgen_docs_anchors_and_references` | non-Civ docs/global/toolkit | `split by owner` | yes | Split residual validator into clearer MapGen docs sub-owners/proof shapes. | Python validator combines anchor existence, workspace alias policy, glossary policy, legacy-router checks, and warning/error policy. |
| `ensure_docs_checkout_paths_are_portable` | non-Civ docs/global/toolkit | `no action` | no | Stay as docs hygiene rule. | Grit docs-only rewrite pattern over `docs/**/*.md`; empty baseline. |
| `enforce_workspace_import_boundaries` | non-Civ docs/global/toolkit | `no action` | no | Stay as workspace boundary graph rule. | Native Nx `habitat:boundaries` already enforces taxonomy through boundary config. |
| `validate_boundary_taxonomy_against_workspace_graph` | non-Civ docs/global/toolkit | `runtime/source validation` | yes | Keep as Habitat source validation of boundary metadata consistency. | Script compares taxonomy doc, tags, Nx graph, and boundary config through policy code. |
| `enforce_formatting_and_import_hygiene` | non-Civ docs/global/toolkit | `runtime/source validation` | yes | Keep or route to native Biome rail. | Rule delegates to `bun run biome:ci`; Biome owns formatting/import hygiene. |
| `prohibit_pnpm_files_in_bun_workspace` | non-Civ docs/global/toolkit | `no action` | no | Stay as package-manager file-layer guard. | Root package manager is Bun; guard forbids pnpm workspace files. |
| `require_owner_workflow_for_host_protected_surfaces` | non-Civ docs/global/toolkit | `runtime/source validation` | yes | Keep as global Habitat host-policy guard over declared protected surfaces. | File-layer host-surface guard delegates to host-policy/protected-zone source decisions. |
| `verify_habitat_cli_smoke_contract` | non-Civ docs/global/toolkit | `runtime/source validation` | yes | Keep as Habitat CLI integration validation. | Bun script exercises Habitat help and JSON check output. |
| `prohibit_product_scan_roots_in_grit_provider` | non-Civ docs/global/toolkit | `boundary inversion` | yes | Replace negative product-root string guard with explicit provider/registry boundary authority. | Grit provider is generic tooling; registry owns scan roots. |
| `validate_habitat_service_module_file_shape` | non-Civ docs/global/toolkit | `closed structure inversion` | yes | Invert into admitted service-module file-shape authority. | Custom script contains suffix allowlists and comments pointing to positive subject-local pattern allowlist. |
| `validate_habitat_service_module_root_topology` | non-Civ docs/global/toolkit | `no action` | no | Stay as service-module root topology structure rule. | Already structure TOML with closed allowed module/model roots. |

## Cross-Lane Insights

- G4 domain import policy is spread across several negative domain blueprint
  rules. The likely state-space reducer is a positive allowed import matrix,
  with tests split by public-contract tests versus focused internal tests.
- Several standard recipe top-level rules are duplicate proof rails for native
  package tests or source constructors. These should be handled as
  consolidation/dedup packets, not one-off deletions.
- Foundation has many negative retired-token guards. The stronger work is
  closed structure inversion for allowed op/stage/schema structure and native
  source validation for config/contract surfaces.
- `_remainder` rows are not all the same kind of debt. Current interim actions
  include retirement, split by owner, positive authority creation, closed
  structure inversion, boundary inversion, and runtime/source validation.
- `domain-operation-strategy` is not yet justified by returned source evidence.
  Foundation strategy locality currently reads as operation-internal strategy
  boundary pressure, not enough for standalone kind admission.
- Generated-output checks should be treated carefully: generated outputs prove
  generation/currentness, not product policy. Several rows likely belong in
  generator/package/native validation rails.
- Standard recipe topology and public authoring have multiple duplicate rails:
  source constructors and native tests already carry some invariants that
  Habitat currently re-checks through hard-coded lists or generated-output
  comparison.
- Morphology stage rules include several rows where the rule packet's
  `pathCoverage` says `morphology*`, but Grit regexes/scan roots enumerate only
  some morphology stages. The returned lane marks those rows complete for
  Layer 1 action classification but needing Layer 2 scope-intent resolution
  before mutation.
- Placement terminal apply and product materialization are distinct owners.
  `require_typed_placement_outcomes_before_apply` is true for the terminal
  apply file, but not sufficient for resource/discovery materialization policy,
  especially the current official discovery generator call.
- Studio has several rules where the invariant is real but the Habitat runner
  is a currentness/string proxy for stronger package tests or Nx/project source
  semantics. One row has direct stale runner support
  (`enforce_studio_dev_runner_topology`).
- Platform/resource lanes show a useful split between graph-owned project
  boundaries and Habitat/package-local source predicates. Nx cannot replace
  virtual `/base-standard/` import text checks, generated-zone edit guards, or
  exact bootstrap/source-surface checks.
- Non-Civ rows include hidden Civ/MapGen docs authority, but not hidden
  MapGen runtime authority. The MapGen docs rows should stay docs-owned unless
  a later docs-specific split says otherwise.
- Habitat toolkit rows show the same pattern as product rows: some rules are
  already positive structure, while others are negative/string proxies for
  provider/registry or service-module authority.

## Pending Convergence Requirements

Before Layer 2 packet work can begin:

1. Select the first Layer 2 action-class slice from this matrix.
2. Record the slice selection before creating any Layer 2 decision packets.

Local pre-review checks already completed:

- Main `Action Matrix`: 127 rows for 127 live `rule.json` manifests, no
  duplicates, missing rows, or stale extras.
- `Live Manifest Path Index`: 127 rows for 127 live `rule.json` manifests, no
  duplicates, missing rows, or stale extras.
- Action vocabulary and packet-needed values match the method frame.
- `git diff --check -- .habitat/workstreams/rule-remediation-layer1-action-matrix.md`
  passed.

## Resume State

Current layer: Layer 1.

Current gate: Layer 1 convergence passed and durable Graphite record committed.

Active artifact path:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.md`

Completed lanes: all thirteen lanes listed in `Gate State`.

Pending lanes: none.

Open blockers: none for Layer 1.

Next legal action: select the first Layer 2 action-class slice from this
matrix.

Actions explicitly not authorized: Layer 2 packet production, Layer 3
implementation, file moves, manifest edits, or rule deletion.
