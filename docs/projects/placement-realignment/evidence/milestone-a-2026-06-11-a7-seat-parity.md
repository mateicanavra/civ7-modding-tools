# Milestone A7 — Studio↔Live Seat Parity (first pass, E4.1)

Live side: run `studio-run-in-game-mq95a8mp-o7l` (Huge 106x66, seed 1337,
10 players alive, swooper-earthlike, ToT setup). Live start plots = turn-1
founder-unit positions (A5 probe, `live-identity-a.json`).

Local side: headless mock run at the live frame via the extended dump tool:

```sh
bun ./src/dev/diagnostics/run-standard-dump.ts 106 66 1337 \
  --label a7-live-frame-lat90 --players1 6 --players2 6 \
  --sectorRows 4 --sectorCols 3 --alive 10 --minLat -90 --maxLat 90
```

Frame-matching prework (recorded):

- Live HUGE Maps row (probed): PlayersLandmass1/2 = 6/6, DefaultPlayers 10,
  StartSectorRows/Cols 4/3, no latitude fields.
- Live latitude bounds probed via `GameplayMap.getPlotLatitude` (rows
  0/33/65 → −90/0/+86): the live engine runs ±90, NOT the dump tool's
  historical ±60. With ±60 the local planning digests diverged from live at
  aridity/riverClass/lakeMask (climate consumes latitude; foundation does
  not — landMask/elevation matched even then). New `--minLat/--maxLat`,
  `--players1/--players2/--sectorRows/--sectorCols/--alive` flags +
  `MockAdapterConfig.aliveMajorCount` were added for live-frame replication.
- With ±90: **all artifact-derived planning digests match live exactly**
  (landMask 38bc48f5, elevation 3ea69a4e, aridity 263631b8, riverClass
  75550547, lakeMask 7dd195d5, blockedMask 844568c5, biome 42ceb397). Only
  the two DECLARED engine-read surfaces differ (terrainType e8060fc0 vs
  beb4edc6, featureType 42fcf491 vs 16df8a0c) — exactly the A1-classified
  rivers-stack carving (106 tiles) + feature clearing (~46). This doubles
  as the Milestone B1 drift-window measurement.
- Local resource plan at the matched frame: **226 intents == live 226**
  (mock placed 226/226; live placed 219 with 7 typed legality rejections).

## Seat model fact (both sides)

`buildSeatIdentities` seats `playersWest + playersEast` = **12** seats on
HUGE (mapInfo advertises 6/6) and maps alive ids onto seats in order; the
10 alive players claim seats 0–9 (`alive-majors`), seats 10–11 carry
positional ids 10/11 flagged `slot-index` (recorded, never silent). The
live engine spawns founder units only for the 10 real players; the 2
surplus `setStartPosition` calls target nonexistent ids and are inert.
Product note → DEF-010 (capacity-derived split) trigger evidence: on live
HUGE/10p the slot sum exceeds alive count; capping seats at
`min(slots, alive)` would remove the surplus seats and their downstream
artifacts. Not silently changed here.

## Per-seat comparison (local seat i ↔ live player i)

| seat | local plot | live plot | verdict |
| --- | --- | --- | --- |
| 0 | (34,41) | (34,41) | EXACT |
| 1 | (25,37) | (25,37) | EXACT |
| 2 | (45,19) | (45,19) | EXACT |
| 3 | (47,28) | (39,28) | moved (same row, 8 cols) |
| 4 | (31,48) | (31,48) | EXACT |
| 5 | (42,36) | (48,27) | moved |
| 6 | (83,17) | (90,19) | moved |
| 7 | (96,24) | (95,25) | moved (adjacent tile) |
| 8 | (69,40) | (69,40) | EXACT |
| 9 | (87,24) | (58,26) | moved — note live p9 sits exactly on LOCAL seat 10's plot (58,26) |
| 10 | (58,26) | — (no live player) | surplus slot-index seat |
| 11 | (92,44) | — (no live player) | surplus slot-index seat |

- **6/10 exact**, 1 adjacent-tile, 3 moved. All 12 local seats seated on
  rung 1 (primary, no fallbacks) — matching the live run's zero warn lines.
- Delta classification: **surface drift, not identity or algorithm
  divergence.** The only planning-surface differences at selection time are
  the live navigable-river terrain carving + cleared features
  (A1: T-NAV/F-NAV-CLEAR, rivers-stack owner). Start scoring consumes
  terrain/feature-derived components (freshwater, roughness, resources), so
  carved river corridors legitimately shift scores and the spacing cascade
  relocates a subset of seats; seat 9's live plot coinciding with local
  seat 10's plot is the spacing cascade re-ranking under a shifted east-mass
  surface. Identity model verified: ids contiguous, ordering preserved on
  every matched seat, no doubling (E1.2 holds live).

## E4.1 verdict (first pass)

**Classified-partial.** Seat count identical (10 live = 10 alive-mapped
seats), 6/10 plots identical, every delta attributed to the named
rivers-stack live-vs-mock terrain/feature drift (already tracked in that
stack); zero unexplained deltas, zero identity violations. Full E4.1
(plots identical) becomes reachable when the rivers stack closes the
modelRivers mock-emulation gap — placement-side changes are NOT indicated.
