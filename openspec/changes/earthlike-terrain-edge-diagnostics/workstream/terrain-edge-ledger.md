# Terrain Edge Ledger

## Scope

- Source proof:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json`.
- Source proof hash:
  `4973f47b8dd83e9710088d33485b2a985fcdf4dee71b140f2aa23b4bc55ac1dc`.
- Terrain context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-context.json`.
- Terrain context artifact sha256:
  `7c17cb5ecde54909ba7d0e58647403e19b3341739ab297568c2de654270b647f`.
- Local mask/projection context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-local-mask-context.json`.
- Local mask/projection context artifact sha256:
  `3b6822d02ddd9844e872dfafa1879860ecfd12d6558df43cfe75a1aed726aec2`.
- Live readback context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-live-readback-context.json`.
- Live readback context artifact sha256:
  `213134d7020063f53073c2f6f254ae8fc0d153007b0b6e0848c2da4a642262f6`.
- Live readback proof hash:
  `aa817119c628d1ecc144c5dd7ed4d3227f6fe3301af1ffab501e26751868c2a8`.
- Local validation-boundary context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-validation-boundary-context.json`.
- Local validation-boundary context artifact sha256:
  `033609d9293faf4b86a1da5862247a4c41762e7917069be3f2af7c8e7f55f263`.
- Local validation-boundary proof hash:
  `e906acdcacb002572586379b98cd00d0eb99529c9b86e2384fc6b8e03703da4e`.
- Request: `studio-run-in-game-mq20rbzr-1fhc`.
- Seed/dimensions: `138503614`, `106x66`, `6996` plots.

## Boundary

This ledger records terrain row context and row-level source-authority
classification. It does not authorize repair by itself, prove parity, or prove
product acceptance.

## Rows

| Row | Coordinate |   Plot | Local           | Live            | Class                    | Neighborhood                                   | Status     |
| --- | ---------- | -----: | --------------- | --------------- | ------------------------ | ---------------------------------------------- | ---------- |
| T1  | `(73,36)`  | `3889` | `TERRAIN_OCEAN` | `TERRAIN_COAST` | `local-ocean-live-coast` | local/live both `coast:4`, `ocean:2`, `land:0` | classified: local mock/materialization terrain parity |
| T2  | `(65,39)`  | `4199` | `TERRAIN_COAST` | `TERRAIN_OCEAN` | `local-coast-live-ocean` | local/live both `coast:2`, `ocean:3`, `land:1` | classified: local mock/materialization lake+terrain parity |

## Local Projection Context

| Row          | Morphology shelf/coast                                                 | Hydrology lake intent             | Map-hydrology projection                                               | Placement snapshot                    | Current disposition                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1 `(73,36)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:0`, `engineTerrain:TERRAIN_OCEAN` | `landMask:0`, `terrain:TERRAIN_OCEAN` | Local pipeline consistently keeps ocean and non-lake water; live coast assigns the row to local mock/materialization terrain parity rather than authored shelf/coast intent. |
| T2 `(65,39)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:1`, `engineTerrain:TERRAIN_COAST` | `landMask:0`, `terrain:TERRAIN_COAST` | Local pipeline keeps coast/lake-classified water despite no planned lake mask; live ocean/non-lake assigns the row to local mock/materialization lake+terrain parity. |

The local evidence narrows both rows away from simple morphology shelf/coast
intent and planned Hydrology lake intent. Combined with exact live readback and
validation-boundary evidence, the remaining owner is classified as repo-owned
local mock/materialization parity rather than map-generation tuning.

## Live Readback Context

The live readback verifier is bound to the saved final-surface proof by request
identity and current runtime identity. It requires successful row facts for
`terrain`, `water`, `lake`, `riverType`, `areaId`, `regionId`, and
`landmassId`; missing or failed facts block the packet.

| Row          | Live terrain/hydrology                                      | Live area/region                                   | Local/live contrast                                                                                                                | Current disposition                                                                                                                     |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| T1 `(73,36)` | `TERRAIN_COAST`, `water:true`, `lake:false`, `riverType:-1` | `areaId:720906`, `regionId:-1`, `landmassId:65536` | local projection `TERRAIN_OCEAN`, `engineLakeMask:0`, `engineAreaId:1`; live is same water body identity class but coast terrain   | Classified as local mock/materialization terrain parity; repair must not tune authored coast/shelf masks. |
| T2 `(65,39)` | `TERRAIN_OCEAN`, `water:true`, `lake:false`, `riverType:-1` | `areaId:720906`, `regionId:-1`, `landmassId:65536` | local projection `TERRAIN_COAST`, `engineLakeMask:1`, `engineAreaId:1`; live reports non-lake ocean in the same live area/landmass | Classified as local mock/materialization lake+terrain parity; mock lake evidence is over-broad because generic coast reads as lake. |

## Local Validation Boundary

The placement validation-boundary artifact records local engine facts around the
placement surface maintenance sequence. It is diagnostic source-authority
evidence only.

| Row          | Before validate                                                  | After validate                                                   | After maintenance                                                | Disposition                                                                                                                                                         |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1 `(73,36)` | `TERRAIN_OCEAN`, `waterMask:1`, `lakeMask:0`, `areaId:1`         | `TERRAIN_OCEAN`, `waterMask:1`, `lakeMask:0`, `areaId:1`         | `TERRAIN_OCEAN`, `waterMask:1`, `lakeMask:0`, `areaId:1`         | Local placement validation/maintenance does not move this row; the remaining mismatch is local mock/materialization versus live Civ terrain materialization. |
| T2 `(65,39)` | `TERRAIN_COAST`, `waterMask:1`, `lakeMask:1`, `areaId:1`         | `TERRAIN_COAST`, `waterMask:1`, `lakeMask:1`, `areaId:1`         | `TERRAIN_COAST`, `waterMask:1`, `lakeMask:1`, `areaId:1`         | Local placement validation/maintenance does not move this row; the remaining mismatch is local mock/materialization versus live Civ terrain/lake facts. |

## Owner Classification

| Row          | Classified owner                              | Evidence                                                                                                                                        | Repair authority                                                                                                                       |
| ------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| T1 `(73,36)` | `local-mock-vs-live-civ-terrain-materialization` | Local row is ocean/non-lake through projection and validation; live exact readback is coast/non-lake in the same water body class.               | Bounded adapter/mock materialization parity only. No map-morphology coast/shelf or product tuning authority.                           |
| T2 `(65,39)` | `local-mock-vs-live-civ-lake-terrain-materialization` | Local row is coast/lake-classified with `plannedLakeMask:0`; live exact readback is ocean/non-lake; mock `isLake` uses coast terrain as lake evidence. | Bounded adapter/mock lake readback and terrain materialization parity only. No broad Hydrology, coast/shelf, or Earthlike tuning authority. |

Rejected owner classes for this row pair:

- `map-morphology-coast-shelf-projection`: local morphology masks do not mark
  either row as shelf/coast intent.
- `map-hydrology-water-mutation`: Hydrology lake intent and planned lake masks
  are `0` for both rows; the T2 lake signal appears in mock readback, not in
  authored lake intent.
- `accepted-civ-engine-residual`: not classified as accepted residual because
  the exact live run gives concrete non-lake water facts and the local proof
  path is expected to model the deployed materialization boundary before parity
  closure.

## Next Classification Evidence

- Open a separate repair lane before changing adapter/mock materialization code.
- Rerun exact-authored final-surface parity after any repair and keep parity
  open until terrain rows match or residuals are explicitly owner-classified.
