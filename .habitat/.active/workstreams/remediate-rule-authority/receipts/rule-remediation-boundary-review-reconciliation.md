# Boundary Review Reconciliation

Status: closed

Branch: `codex/habitat-boundary-review-reconciliation`

## Purpose

Reconcile the remaining `boundary inversion` packet-needed rows after fresh
read-only review by stable owner lane.

The review separated the boundary class into three outcomes:

- already honest context rails;
- implementation-ready boundary inversion slices;
- sealed semantic blockers.

## Context Admission Rows

| Rule id | Reason |
| --- | --- |
| `prohibit_foundation_decomposed_ops_legacy_internal_imports` | Already owns narrow Foundation decomposition currentness for retired internal op paths. |
| `prohibit_foundation_rules_tectonics_shim_reexports` | Already owns narrow Foundation operation-rules shim re-export prevention. |
| `prohibit_foundation_strategy_nonlocal_imports` | Already owns Foundation-specific strategy locality and is not every valid domain-operation strategy. |
| `prohibit_hydrology_runtime_continent_step_tokens` | Already owns Hydrology climate-baseline relapse prevention for placement/runtime continent tokens. |
| `prohibit_map_morphology_legacy_plate_driver_dependencies` | Already owns map-morphology relapse prevention against rereading Foundation plate drivers. |
| `prohibit_migrated_consumer_effect_gating_tokens` | Already owns exact migrated-consumer cleanup in the map-hydrology lakes contract. |
| `prohibit_product_scan_roots_in_grit_provider` | Already owns Grit-provider genericness; registry metadata owns product scan roots. |

## Implementation-Ready Queue

| Slice id | Rules | Reason |
| --- | --- | --- |
| `foundation-config-boundary-rail` | `prohibit_foundation_op_contract_config_bags`, `prohibit_foundation_step_contract_config_bags` | Foundation operation and step contracts should own schemas locally instead of importing root config bags. |
| `projection-adapter-call-owner-boundary` | `prohibit_misplaced_projection_adapter_calls` | Projection/materialization adapter call owners are source-backed and can stay Grit/static call-shape authority. |
| `morphology-stage-config-import-boundary` | `prohibit_morphology_stage_config_bag_imports` | Import policy already names domain-specific config facades as the allowed recipe config surface. |

## Sealed Blockers

| Rule id | Blocker |
| --- | --- |
| `prohibit_morphology_hotspot_overlay_publishers` | Morphology versus Gameplay/Narrative overlay ownership is a product/architecture decision. |
| `prohibit_morphology_story_overlay_contract_artifact` | Same overlay ownership decision; do not mutate until the owner posture is sealed. |
| `prohibit_morphology_overlay_implementation_reads` | Likely positive step implementation/declared-dependency authority; needs a decision packet before mutation. |

## Verification

Run focused checks for context-admitted rules, reconcile the canonical JSON
with live manifests, run `bun habitat classify .habitat`, and run
`git diff --check`.
