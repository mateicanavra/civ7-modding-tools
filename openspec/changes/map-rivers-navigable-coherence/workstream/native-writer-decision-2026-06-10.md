# Native River Writer Decision

Date: 2026-06-10

## Decision

Use `TerrainBuilder.modelRivers(...)` only as the bounded Civ-native
materialization pass after `map-rivers` stamps the Hydrology-selected
`TERRAIN_NAVIGABLE_RIVER` terrain mask. Hydrology remains the source of river
truth; `map-rivers` owns projection/materialization/readback; the native writer
is not a public selector, upstream river generator, or proof substitute.

This supersedes the earlier same-day terrain-only decision below. That decision
correctly rejected unbounded whole-map native river generation because it added
extra fragments and no-sink components, but the terrain-only alternative left
Civ river metadata and model objects absent. Later adapter/runtime evidence
proved the stock Civ sequence can create native river metadata after authored
terrain stamping, so the current path is:

1. select from Hydrology-authored river truth;
2. stamp only the selected navigable terrain mask;
3. run the adapter-owned native bulk materialization pass;
4. validate terrain, define named rivers, recalculate areas, and store water;
5. prove terrain and metadata outcomes by same-run readback.

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
- Follow-up runtime and adapter slices reclassified native river metadata as an
  available readback/materialization surface when `GameplayMap.getRiverType`
  exists after `TerrainBuilder.modelRivers(...)`. Exact Hydrology parity,
  especially for minor rivers, remains open until same-run evidence compares
  planned intent masks to `engineNavigableRiverMask` and
  `engineMinorRiverMask`.

## Consequence

Official stock scripts use `modelRivers(...)`, and `@civ7/map-policy` records
the stock Civ arguments as pure Civ facts. Swooper may use that surface only
inside `map-rivers` after Hydrology projection has already selected terrain.
Product acceptance still requires same-run terrain, metadata, Studio, and
rendered-visibility proof; a successful native call alone is not acceptance.
