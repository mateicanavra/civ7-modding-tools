# Domino 049: Atomize Mixed Civ7 Remainder Rules

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

Seven mixed or superseded Civ7 `_remainder` packets were removed. Six split into twelve atomic live rules under their owning contexts, while the broad foundation advanced-fragment aggregate was consolidated into two existing foundation-stage rules.

## Detail

#### Domino 49 Disposition Receipt

This receipt runs the Civ7 remainder atomicity pass requested after the
`_blueprints` burndown. The goal was not a metadata sweep. The goal was to
remove mixed-owner rule units that would pollute later category and inversion
sweeps.

Metrics:

- Starting Civ7 `_remainder` rows: 23.
- Mixed/split candidates processed: 7.
- Superseded aggregate rows removed: 7.
- New atomic live rules created: 12.
- Existing atomic rules widened to absorb a superseded aggregate: 2.
- Ending live rule manifests: 131.
- Ending Civ7 `_remainder` rows: 16.
- New child lanes introduced from source-backed owners:
  `civ7/mapgen/domains/narrative/rules` and
  `civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/hydrology/rules`.

Decision matrix:

| Old rule | Decision | Replacement / owner | Reason |
| --- | --- | --- | --- |
| `prohibit_foundation_contract_config_bags` | split and delete aggregate | `prohibit_foundation_op_contract_config_bags` in `civ7/mapgen/domains/foundation/rules`; `prohibit_foundation_step_contract_config_bags` in `civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules` | The old predicate mixed foundation domain operation contracts with standard-recipe foundation step contracts. |
| `require_owned_domain_config_catalog_surfaces` | split and delete aggregate | `require_morphology_config_facade_exports` in `civ7/mapgen/domains/morphology/rules`; `require_standard_recipe_tag_catalog_owner_tokens` in `civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules` | The old positive script mixed morphology config-facade exactness with standard recipe tag-catalog currentness. |
| `prohibit_runtime_continent_step_tokens` | split and delete aggregate | `prohibit_morphology_runtime_continent_step_tokens` in `stages/morphology/rules`; `prohibit_hydrology_runtime_continent_step_tokens` in `stages/hydrology/rules` | The old Grit rule mixed morphology implementation files with hydrology climate-baseline implementation files. |
| `preserve_morphology_contracts_and_overlay_ownership` | split and delete aggregate | `preserve_morphology_belt_driver_contracts` in `stages/morphology/rules`; narrative HOTSPOTS overlay ownership later retired by narrative burn-down | The old script mixed morphology belt-driver contract currentness with narrative HOTSPOTS overlay publisher ownership. |
| `prohibit_legacy_morphology_effect_gating_tokens` | split and delete aggregate | `prohibit_morphology_stage_legacy_effect_gates` in `stages/morphology/rules`; `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` in standard-recipe `rules` | The old Grit rule mixed morphology stage source with the standard recipe tag catalog. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | split and delete aggregate | `prohibit_morphology_contract_legacy_plate_driver_dependencies` in `stages/morphology/rules`; `prohibit_map_morphology_legacy_plate_driver_dependencies` in `stages/map/rules` | The old Grit rule mixed morphology contract dependency cleanup with map-morphology projection implementation cleanup. |
| `prohibit_foundation_advanced_cast_merge_fragments` | consolidate and delete aggregate | Existing `prohibit_foundation_stage_cast_merge_hacks` and `prohibit_foundation_stage_sentinel_passthrough` in `stages/foundation/rules` | The old aggregate was already split by two narrower live foundation-stage rules; its missing named-token coverage was folded into those rules instead of creating a third duplicate. |

Review lanes:

- Foundation/config reviewer: confirmed the foundation config-bag row should
  split by source owner and must not be generalized into `domain-operation`.
- Morphology/recipe reviewer: confirmed the morphology/overlay/effect/plate
  rows should split by morphology stage, map stage, standard tag catalog, and
  narrative owner.
- Workstream owner disposition: no `_triage` lane was introduced; all new rows
  are live owner-context rules, and only source-backed child lanes were added.

Residual scope:

- The remaining Civ7 `_remainder` rows are no longer blocked by these seven
  mixed-owner aggregates.
- This slice deliberately did not perform the later metadata/category sweep.
  The next sweep should operate on the now-atomic corpus.
