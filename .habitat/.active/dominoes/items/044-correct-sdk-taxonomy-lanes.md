# Domino 044: Correct SDK Taxonomy Lanes

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The Civ7 modding SDK niche was renamed to `civ7/mod-sdk`, while MapGen core and visualization moved under `civ7/mapgen/sdk/{core,visualization}` as MapGen SDK package-surface lanes. The correction preserves package ownership without making the mod SDK the owner of MapGen internals.

## Detail

#### Domino 44 Disposition Receipt

This receipt captures the SDK taxonomy correction requested after the initial
SDK/core/visualization pruning. It is a naming and grouping correction over the
already-demoted packets, not a new blueprint admission.

Source-backed structure:

- `packages/sdk` is the Civ7 modding SDK. Its Habitat authority lane is now
  `civ7/mod-sdk`, because its root concern is mod authoring, with the
  explicit runtime-bound `@mateicanavra/civ7-sdk/mapgen` subpath as an opt-in.
- `packages/mapgen-core` and `packages/mapgen-viz` are MapGen package surfaces.
  They now sit under `civ7/mapgen/sdk/{core,visualization}` to reflect the
  MapGen SDK grouping without implying ownership by the Civ7 mod SDK package.
- `map-output` is not touched in this slice. Its remaining physical
  `_remainder` row is still reserved for the projection contract surface frame.

Moved packets:

| Rule | From | To | Reason |
| --- | --- | --- | --- |
| `require_explicit_mapgen_sdk_opt_in` | `civ7/sdk/rules` | `civ7/mod-sdk/rules` | The predicate protects `packages/sdk` root-vs-mapgen-runtime subpath isolation, so the honest owner is the mod SDK lane. |
| `preserve_mapgen_core_runtime_neutrality` | `civ7/mapgen/core/rules` | `civ7/mapgen/sdk/core/rules` | The predicate protects the MapGen core package as part of the MapGen SDK package surface. |
| `prohibit_runtime_helper_redeclarations` | `civ7/mapgen/core/rules` | `civ7/mapgen/sdk/core/rules` | Shared deterministic helpers belong to the MapGen core package surface, not to the mod SDK. |
| `verify_visualization_runtime_build_artifacts` | `civ7/mapgen/visualization/rules` | `civ7/mapgen/sdk/visualization/rules` | The predicate checks MapGen visualization package/runtime dependency currentness under the MapGen SDK grouping. |

Residual scope:

- `.habitat/civ7/mapgen/map-output/_remainder/prohibit_realized_map_artifact_tags`
  remains the next focused projection-contract-surface decision.
- The three `mod-map` blueprint rows with `placement.niche:
  "civ7/mapgen/map-output"` remain for the following map-output cleanup, where
  their manifest niche should be reassessed separately from the physical
  remainder row.
