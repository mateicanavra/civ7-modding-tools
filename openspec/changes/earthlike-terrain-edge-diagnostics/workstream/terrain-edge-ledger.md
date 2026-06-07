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
- Source-recorded post-mock-materialization-repair final-surface parity artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-mock-materialization-repair.json`.
- Source-recorded post-repair parity artifact sha256:
  `b91ad36796d627a2d9b7381e3a20dcd5b0b604ba623d81e38235cb1061e950f3`.
- Source-recorded post-repair parity proof hash:
  `194dc8d2a22469dfc3612d6038cf1dae26574f35a56b3f6ab67062b55b18a289`.
- Source-recorded post-repair terrain-edge context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-mock-materialization-repair-terrain-edge-context.json`.
- Source-recorded post-repair terrain-edge context artifact sha256:
  `cc28a662c6270feb053a227fd221c15cd00504e3cf54c67ab1bc21e4611e6aa6`.
- Post-repair coast materialization parity artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-coast-materialization-context.json`.
- Post-repair coast materialization parity artifact sha256:
  `a14455a238ac6e0296f116827c2d842ea2621561be38862696fceb3084a2bb11`.
- Post-repair coast materialization parity proof hash:
  `8dfb35f12c493895c21057543dbe7bff0f365b5437b43f0bb0b186d3fda864dc`.
- Post-repair coast materialization context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-coast-materialization-context.json`.
- Post-repair coast materialization context artifact sha256:
  `59378d7c5d90593958e14ecf66f966107499499ef0eb4f616978226e3e3b0b93`.
- Post-repair coast materialization context proof hash:
  `c58aee8b820ac50355705bb500e48863b389776b219acd86ee1c390d2cd76b5e`.
- Request: `studio-run-in-game-mq20rbzr-1fhc`.
- Seed/dimensions: `138503614`, `106x66`, `6996` plots.

## Boundary

This ledger records terrain row context, row-level source-authority
classification, and the bounded mock lake readback repair. It does not prove
terrain parity, final-surface parity, or product acceptance.

## Rows

| Row | Coordinate |   Plot | Local           | Live            | Class                    | Neighborhood                                   | Status     |
| --- | ---------- | -----: | --------------- | --------------- | ------------------------ | ---------------------------------------------- | ---------- |
| T1  | `(73,36)`  | `3889` | `TERRAIN_OCEAN` | `TERRAIN_COAST` | `local-ocean-live-coast` | local/live both `coast:4`, `ocean:2`, `land:0` | classified: local mock/materialization terrain parity |
| T2  | `(65,39)`  | `4199` | `TERRAIN_COAST` | `TERRAIN_OCEAN` | `local-coast-live-ocean` | local/live both `coast:2`, `ocean:3`, `land:1` | lake sub-gap repaired; terrain materialization remains |

## Pre-Repair Local Projection Context

| Row          | Morphology shelf/coast                                                 | Hydrology lake intent             | Map-hydrology projection                                               | Placement snapshot                    | Current disposition                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1 `(73,36)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:0`, `engineTerrain:TERRAIN_OCEAN` | `landMask:0`, `terrain:TERRAIN_OCEAN` | Local pipeline consistently keeps ocean and non-lake water; live coast assigns the row to local mock/materialization terrain parity rather than authored shelf/coast intent. |
| T2 `(65,39)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:1`, `engineTerrain:TERRAIN_COAST` | `landMask:0`, `terrain:TERRAIN_COAST` | Local pipeline keeps coast/lake-classified water despite no planned lake mask; live ocean/non-lake assigns the row to local mock/materialization lake+terrain parity. |

The pre-repair local evidence narrowed both rows away from simple morphology
shelf/coast intent and planned Hydrology lake intent. The later mock lake
repair removed the T2 lake-readback sub-gap; current remaining source authority
is recorded in the post-repair coast materialization section below.

## Live Readback Context

The live readback verifier is bound to the saved final-surface proof by request
identity and current runtime identity. It requires successful row facts for
`terrain`, `water`, `lake`, `riverType`, `areaId`, `regionId`, and
`landmassId`; missing or failed facts block the packet.

| Row          | Live terrain/hydrology                                      | Live area/region                                   | Local/live contrast                                                                                                                | Current disposition                                                                                                                     |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| T1 `(73,36)` | `TERRAIN_COAST`, `water:true`, `lake:false`, `riverType:-1` | `areaId:720906`, `regionId:-1`, `landmassId:65536` | local projection `TERRAIN_OCEAN`, `engineLakeMask:0`, `engineAreaId:1`; live is same water body identity class but coast terrain   | Classified as local mock/materialization terrain parity; repair must not tune authored coast/shelf masks. |
| T2 `(65,39)` | `TERRAIN_OCEAN`, `water:true`, `lake:false`, `riverType:-1` | `areaId:720906`, `regionId:-1`, `landmassId:65536` | pre-repair local projection `TERRAIN_COAST`, `engineLakeMask:1`, `engineAreaId:1`; live reports non-lake ocean in the same live area/landmass | Pre-repair mock lake evidence was over-broad because generic coast read as lake; post-repair current gap is terrain materialization. |

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
| T2 `(65,39)` | `local-mock-vs-live-civ-lake-terrain-materialization` | Pre-repair local row was coast/lake-classified with `plannedLakeMask:0`; live exact readback was ocean/non-lake; mock `isLake` used coast terrain as lake evidence. | Mock lake readback repaired; remaining repair authority is bounded adapter/mock terrain materialization parity only. |

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

- Mock lake readback has been repaired and verified locally.
- Continue with the remaining terrain materialization parity gap. The source
  post-repair artifact still shows T1 local ocean/live coast and T2 local
  coast/live ocean, but the current drain exact rerun is blocked by stale proof
  config and must be refreshed before any parity claim.
- Rerun exact-authored final-surface parity after any repair and keep parity
  open until terrain rows match or residuals are explicitly owner-classified.

## Source-Recorded Post-Repair Evidence

| Row          | Post-repair local | Live            | Post-repair lake evidence               | Disposition                                                                 |
| ------------ | ----------------- | --------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| T1 `(73,36)` | `TERRAIN_OCEAN`   | `TERRAIN_COAST` | `engineLakeMask:0`, validation `lake:0` | Unchanged terrain materialization mismatch; lake readback is not implicated. |
| T2 `(65,39)` | `TERRAIN_COAST`   | `TERRAIN_OCEAN` | `engineLakeMask:0`, validation `lake:0` | Mock lake over-read repaired; terrain materialization mismatch remains.      |

The source-recorded post-repair proof remains `parityStatus:"unresolved"` with
terrain `2/6996`, feature `5/6996`, and resource `61/6996` mismatches. In the
current drain, `bun run verify:final-surface-parity -- --proof-file ...` is
blocked by stale exact proof config key
`/config/ecology-features/floodplainPlanning`, so this layer does not claim
fresh final-surface parity proof or product acceptance.

## Coast Materialization Boundary

The source-recorded post-repair coast materialization artifact adds
map-morphology coast policy and engine terrain snapshots before and after local
terrain validation. It is diagnostic source-authority evidence only.

| Row          | Coast policy                                                                 | After `plot-coasts` | After `plot-continents` | Downstream local snapshots | Live exact readback | Disposition |
| ------------ | ----------------------------------------------------------------------------- | ------------------- | ----------------------- | -------------------------- | ------------------- | ----------- |
| T1 `(73,36)` | `baseWaterClass:2`, `waterClass:2`, `policyCoastMask:0`, `coastBufferTiles:4` | `TERRAIN_OCEAN`     | `TERRAIN_OCEAN`         | remains `TERRAIN_OCEAN` through hydrology, rivers, placement, and validation | `TERRAIN_COAST` | Local mock/materialization under-models this live coast result; no authored morphology shelf/coast intent exists at the row. |
| T2 `(65,39)` | `baseWaterClass:2`, `waterClass:2`, `policyCoastMask:0`, `coastBufferTiles:4` | `TERRAIN_OCEAN`     | `TERRAIN_COAST`         | remains `TERRAIN_COAST` through hydrology, rivers, placement, and validation | `TERRAIN_OCEAN` | Local `validateAndFixTerrain`/mock materialization over-models coast here; lake readback is repaired and no Hydrology lake intent exists. |

The remaining terrain owner is classified as local mock/Civ materialization
parity at the adapter terrain-validation boundary. This does not authorize a
MapGen coast/shelf tuning change. A repair, if opened, must be a separate
bounded terrain materialization parity layer followed by exact-authored parity
rerun.
