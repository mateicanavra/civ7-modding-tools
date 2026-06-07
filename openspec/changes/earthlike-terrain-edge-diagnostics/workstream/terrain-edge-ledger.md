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
- Request: `studio-run-in-game-mq20rbzr-1fhc`.
- Seed/dimensions: `138503614`, `106x66`, `6996` plots.

## Boundary

This ledger records terrain row context. It does not assign source authority,
authorize repair, prove parity, or prove product acceptance.

## Rows

| Row | Coordinate | Plot | Local | Live | Class | Neighborhood | Status |
|---|---|---:|---|---|---|---|---|
| T1 | `(73,36)` | `3889` | `TERRAIN_OCEAN` | `TERRAIN_COAST` | `local-ocean-live-coast` | local/live both `coast:4`, `ocean:2`, `land:0` | unresolved |
| T2 | `(65,39)` | `4199` | `TERRAIN_COAST` | `TERRAIN_OCEAN` | `local-coast-live-ocean` | local/live both `coast:2`, `ocean:3`, `land:1` | unresolved |

## Local Projection Context

| Row | Morphology shelf/coast | Hydrology lake intent | Map-hydrology projection | Placement snapshot | Current disposition |
|---|---|---|---|---|---|
| T1 `(73,36)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:0`, `engineTerrain:TERRAIN_OCEAN` | `landMask:0`, `terrain:TERRAIN_OCEAN` | Local pipeline consistently keeps ocean; live coast needs live water/area readback before owner classification. |
| T2 `(65,39)` | `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, `distanceToCoast:18` | `lakeMask:0`, `plannedLakeMask:0` | `engineWaterMask:1`, `engineLakeMask:1`, `engineTerrain:TERRAIN_COAST` | `landMask:0`, `terrain:TERRAIN_COAST` | Local pipeline consistently keeps coast/lake-classified water despite no planned lake mask at this row; live ocean needs live water/area readback before owner classification. |

The local evidence narrows both rows away from simple morphology shelf/coast
intent and planned Hydrology lake intent. It does not yet prove whether the
remaining owner is local projection/materialization, Civ live validation, or a
readback/evidence gap.

## Owner Candidates

| Candidate | Current disposition |
|---|---|
| `map-morphology-coast-shelf-projection` | possible; needs local shelf/coast masks and projection-boundary terrain snapshots |
| `map-hydrology-water-mutation` | possible; needs lake/river/water mutation evidence at the rows |
| `civ-engine-terrain-validation` | possible; needs before/after `validateAndFixTerrain` and live water/area readback |
| `evidence-insufficient` | current status until the evidence above exists |

## Next Classification Evidence

- Local shelf/coast/lake/water-protection masks for both rows.
- Projection-boundary engine terrain snapshots around terrain validation.
- Live water/lake/area readback for both rows.
- Explicit owner disposition before any coast/shelf policy repair.
