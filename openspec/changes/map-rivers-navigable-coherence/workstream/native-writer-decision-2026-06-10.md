# Native River Writer Decision

Date: 2026-06-10

## Decision

Do not call `TerrainBuilder.modelRivers(...)` in the authored Swooper
`map-rivers` projection path. Preserve the Hydrology-selected
`TERRAIN_NAVIGABLE_RIVER` mask directly, then validate terrain, define names,
refresh areas/water, and prove parity through readback.

## Evidence

- Same-seed local projection selected 24 terminal-anchored navigable-river
  terrain tiles after resource exclusion and Hydrology selection fixes.
- Same-seed live Civ readback after native `modelRivers(...)` restoration
  reported 84 `TERRAIN_NAVIGABLE_RIVER` tiles.
- Resource overlap was zero, so resource placement was not the remaining cut-off
  source.
- Ten live river components had no water/lake sink; the sampled components were
  not MapGen-selected projected tiles and were added by the native whole-map
  generator.
- Same-seed live Civ readback after removing `modelRivers(...)` and deploying
  authored terrain materialization reported 25 `TERRAIN_NAVIGABLE_RIVER` tiles,
  zero resource overlap, and zero no-sink terrain-river components. Civ river
  metadata was explicitly absent (`MapRivers.numRivers = 0`,
  `GameplayMap.getRiverType = -1` everywhere), confirming this path is terrain
  materialization, not hidden native river generation.

## Consequence

Official stock scripts still use `modelRivers(...)`, and `@civ7/map-policy`
still records that fact. For Swooper authored maps, that fact is engine evidence
only; it is not product acceptance unless a future writer proves exact
Hydrology-topology parity on the same run.
