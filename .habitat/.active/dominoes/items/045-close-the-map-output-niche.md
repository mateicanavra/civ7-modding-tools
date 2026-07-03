# Domino 045: Close The Map-Output Niche

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The stale `civ7/mapgen/map-output` niche was removed. `prohibit_realized_map_artifact_tags` moved into `blueprints/artifact` as artifact ID namespace authority, while the three mod-map generated/shipped output rows kept `blueprint=mod-map` and were contextualized by `civ7/mapgen/pipeline/swooper-maps-standard-recipe` instead of a renamed catch-all output niche.

## Detail

#### Domino 45 Disposition Receipt

This receipt closes the stale `map-output` lane after the SDK taxonomy
correction. It runs `PROJECTION-CONTRACT-SURFACE-FRAME.md` against the last
physical map-output remainder and updates the three remaining `mod-map`
manifests that still claimed `civ7/mapgen/map-output`.

Source-backed structure:

- `artifact:map.realized.*` is not a live projection surface. The canonical
  Phase 2 projection spec says `artifact:map.*` may describe stable projection
  or observation data products, `effect:map.*` describes execution guarantees,
  and `artifact:map.realized.*` must not be introduced.
- The realized namespace guard therefore belongs to the `artifact` blueprint
  as artifact ID namespace authority. No `projection-contract`,
  `artifact-contract`, `map-output`, or `map-projection` destination was
  created.
- The three `mod-map` rows still belong to the `mod-map` blueprint, but their
  stale `map-output` niche metadata did not justify a replacement
  `mod-integration` niche. The current predicates are tied to the Swooper Maps
  standard recipe lane: canonical map configs, `STANDARD_STAGES`, generated map
  entrypoints, and shipped catalog output.

Moved or recontextualized packets:

| Rule | From | To | Reason |
| --- | --- | --- | --- |
| `prohibit_realized_map_artifact_tags` | `civ7/mapgen/map-output/_remainder` | `blueprints/artifact` | The whole predicate governs an invalid artifact ID namespace. Positive projection semantics already live in the Phase 2 projection spec, so this does not need a new projection surface. |
| `block_studio_config_leakage_into_shipped_catalog` | `placement.niche: civ7/mapgen/map-output` | `placement.niche: civ7/mapgen/pipeline/swooper-maps-standard-recipe` | The guard protects generated/shipped catalog output for the current Swooper Maps standard recipe lane; it is not a standalone output niche or mod-integration area. |
| `protect_generated_map_entrypoints_from_hand_edits` | `placement.niche: civ7/mapgen/map-output` | `placement.niche: civ7/mapgen/pipeline/swooper-maps-standard-recipe` | Generated map entrypoints are produced from the current Swooper map config and standard recipe surface, while the reusable constructible kind remains `mod-map`. |
| `validate_generated_map_entrypoint_contracts` | `placement.niche: civ7/mapgen/map-output` | `placement.niche: civ7/mapgen/pipeline/swooper-maps-standard-recipe` | The executable imports `STANDARD_STAGES`, validates canonical map configs, and checks generated entrypoints; that is current standard-recipe context, not a generic output bucket. |

Residual scope:

- The physical `.habitat/civ7/mapgen/map-output/` lane is gone.
- Historical domino receipts may still mention map-output as the prior
  provisional lane; live manifests and current authority docs no longer do.
