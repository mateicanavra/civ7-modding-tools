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
- Request: `studio-run-in-game-mq20rbzr-1fhc`.
- Seed/dimensions: `138503614`, `106x66`, `6996` plots.

## Boundary

This ledger records terrain row context. It does not assign source authority,
authorize repair, prove parity, or prove product acceptance.

## Rows

| Row | Coordinate |   Plot | Local           | Live            | Class                    | Neighborhood                                   | Status     |
| --- | ---------- | -----: | --------------- | --------------- | ------------------------ | ---------------------------------------------- | ---------- |
| T1  | `(73,36)`  | `3889` | `TERRAIN_OCEAN` | `TERRAIN_COAST` | `local-ocean-live-coast` | local/live both `coast:4`, `ocean:2`, `land:0` | unresolved |
| T2  | `(65,39)`  | `4199` | `TERRAIN_COAST` | `TERRAIN_OCEAN` | `local-coast-live-ocean` | local/live both `coast:2`, `ocean:3`, `land:1` | unresolved |

## Local Projection Context

| Row          | Morphology shelf/coast                                                 | Hydrology lake intent             | Map-hydrology projection                                               | Placement snapshot                    | Current disposition                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1 `(73,36)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:0`, `engineTerrain:TERRAIN_OCEAN` | `landMask:0`, `terrain:TERRAIN_OCEAN` | Local pipeline consistently keeps ocean; live coast needs live water/area readback before owner classification.                                                                |
| T2 `(65,39)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:1`, `engineTerrain:TERRAIN_COAST` | `landMask:0`, `terrain:TERRAIN_COAST` | Local pipeline consistently keeps coast/lake-classified water despite no planned lake mask at this row; live ocean needs live water/area readback before owner classification. |

The local evidence narrows both rows away from simple morphology shelf/coast
intent and planned Hydrology lake intent. It does not yet prove whether the
remaining owner is local projection/materialization, Civ live validation, or a
readback/evidence gap.

## Live Readback Context

The live readback verifier is bound to the saved final-surface proof by request
identity and current runtime identity. It requires successful row facts for
`terrain`, `water`, `lake`, `riverType`, `areaId`, `regionId`, and
`landmassId`; missing or failed facts block the packet.

| Row          | Live terrain/hydrology                                      | Live area/region                                   | Local/live contrast                                                                                                                | Current disposition                                                                                                                     |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| T1 `(73,36)` | `TERRAIN_COAST`, `water:true`, `lake:false`, `riverType:-1` | `areaId:720906`, `regionId:-1`, `landmassId:65536` | local projection `TERRAIN_OCEAN`, `engineLakeMask:0`, `engineAreaId:1`; live is same water body identity class but coast terrain   | Source authority still unresolved; needs projection/validation boundary evidence before repair.                                         |
| T2 `(65,39)` | `TERRAIN_OCEAN`, `water:true`, `lake:false`, `riverType:-1` | `areaId:720906`, `regionId:-1`, `landmassId:65536` | local projection `TERRAIN_COAST`, `engineLakeMask:1`, `engineAreaId:1`; live reports non-lake ocean in the same live area/landmass | Strongest signal for a projection/materialization vs Civ validation gap, but still no repair authority without boundary classification. |

## Owner Candidates

| Candidate                               | Current disposition                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map-morphology-coast-shelf-projection` | less likely as direct row intent; local shelf/coast masks are `0` with distance-to-coast `18`, but projection-boundary terrain snapshots are still needed |
| `map-hydrology-water-mutation`          | still possible through local engine lake/terrain projection, especially T2 where local `engineLakeMask:1` contrasts with live `lake:false`                |
| `civ-engine-terrain-validation`         | still possible; needs before/after `validateAndFixTerrain` or equivalent materialization boundary evidence                                                |
| `evidence-insufficient`                 | current status until the evidence above exists                                                                                                            |

## Next Classification Evidence

- Projection-boundary engine terrain snapshots around terrain validation.
- Explicit owner disposition before any coast/shelf policy repair.
