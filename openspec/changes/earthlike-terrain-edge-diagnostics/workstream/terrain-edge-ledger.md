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
