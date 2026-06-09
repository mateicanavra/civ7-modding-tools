# Parity Corpus Ledger

| Row | Canonical key | Corpus shape | Source path | Authority class | ID/value/action/surface | Group | Current coverage | Uncertainty | Required proof |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | tile.hexOddQ row-major | materialization target | `packages/mapgen-core`, recipe artifact emissions, Studio renderer | local contract | `index = y * width + x`; odd-q for hex math | coordinate | contract tests exist for standard recipe outputs | Studio camera/projection may still visually rotate while data is correct | artifact sample plus live readback `(0,0)->0`, `(1,0)->1`, `(0,1)->width` and screenshot-free coordinate checks |
| 2 | terrain base class | materialization target | `map-morphology`, `map-elevation`, `map-rivers`, placement final snapshot | mixed local/runtime | ocean/coast/flat/hill/mountain/navigable river | terrain-water | local and final live readback measured | live build/elevation/river validation can rewrite terrain after local truth | full-grid local final layer vs live `GameplayMap.getTerrainType` comparison by stage and reason |
| 3 | elevation/land mask | materialization target | `map-elevation/buildElevation.ts`, `engine-heightfield.ts` | runtime projection evidence | adapter elevation and land/water after `TerrainBuilder.buildElevation()` | elevation-water | post-build drift recorded as nonfatal evidence | exact engine elevation model may be hidden | pre/post elevation snapshots plus live readback and drift attribution |
| 4 | coasts/shelves | materialization target | `map-morphology/plotCoasts.ts`, official `expandCoasts` | local truth plus runtime projection | coast/ocean terrain classification | terrain-water | local sets coasts directly and intentionally avoids engine expansion | live validation may still coerce ocean/coast near poles/lakes/rivers | classify mismatches against shelf/coast/lake masks and engine validation calls |
| 5 | lakes | materialization target | hydrology lakes plus map-hydrology projection | local truth plus runtime projection | static lake water tiles | hydrology | expected land includes accepted lakes | engine water storage/area recalculation may alter adjacency state | lake mask vs live terrain and area water readback |
| 6 | rivers | materialization target plus metadata readback | `map-rivers/plotRivers.ts`, `Civ7Adapter.readRiverProjection`, `MockAdapter.readRiverProjection` | local projection plus runtime readback | planned minor river intent, planned major river intent, projected navigable river terrain, raw `TERRAIN_NAVIGABLE_RIVER`, Civ river metadata | hydrology | adapter now separates planned minor/major intent, projected terrain, terrain-row readback, any-river metadata, navigable metadata, and minor metadata | direct terrain stamping can create `TERRAIN_NAVIGABLE_RIVER` without `GameplayMap.isRiver`; `TerrainBuilder.setRiverValidationValues` exists but was rejected by disposable proof because metadata readback was unchanged | compare hydrology river class, planned minor/major masks, projected navigable mask, live terrain row, live `getRiverType`, live `isRiver`, live `isNavigableRiver`, and minor unsupported status |
| 7 | areas/continents | action surface | `plotContinents`, `recalculateAreas`, `storeWaterData` | runtime projection | area ids, continent assignment, water data | topology | projected in pipeline | engine recalculation hidden details may affect legality/starts | live area/continent readback where available and downstream mismatch attribution |
| 8 | biomes | materialization target | `map-ecology/plotBiomes.ts`, placement final snapshot | local truth projected to runtime | biome id per tile | ecology | measured 0/4536 mismatch for Standard seed 2147483647 | needs repeat over fresh bounded run | full-grid biome readback across stable seeds |
| 9 | features | materialization target | `features-apply`, `canHaveFeature`, official terrain data validity | mixed local/runtime | feature id per tile | ecology | live rejects some planned features; mock accepts by default unless injected | exact `TerrainBuilder.canHaveFeature` legality may include hidden terrain/river/adjacency state | per-feature attempted/applied/rejected telemetry plus live readback |
| 10 | resources | materialization target | placement resources, `ResourceBuilder.canHaveResource`, official resources data | mixed local/runtime | resource id per tile | placement | live placed 150 with 27 legal types; local mock can over-accept | official data and runtime legality/catalog can diverge | candidate legality matrix, placement telemetry, full-grid resource readback |
| 11 | natural wonders | materialization target | placement wonders and adapter feature placement | mixed local/runtime | wonder feature placements | placement | currently zero in latest run | future maps/sizes may place wonders | legality/readback when planned count > 0 |
| 12 | starts/discoveries | materialization target | placement starts/discoveries/advanced starts | mixed local/runtime | player starts, discovery ids/effects | placement | not yet part of measured parity table | live side effects may depend on areas/resources/terrain | readback starts and discovery state after terrain/resource parity is stable |
| 13 | Studio rendering projection | materialization target | `apps/mapgen-studio`, `packages/mapgen-viz` | local display contract | visual x/y/camera transform | display | odd-q emission repaired, visual rotation still reported | deck.gl/hex orientation may differ from row-major data orientation | deterministic pixel/tile-pick test and coordinate overlay test |

## Coverage Summary

- Total rows: 13
- Modeled rows: 13
- Blocked or not applicable: 0 known
- Proxy rows: rows 3, 7, 9, and 10 currently proxy hidden engine logic in
  local Studio/mock execution.
- Missing rows: none at the corpus level; several rows need stronger readback
  coverage before implementation closure.
- Runtime ID/readback status: terrain, biome, feature, and resource readback
  are available through the CLI; areas, starts, and discoveries require a
  follow-up readback wrapper if existing direct-control surfaces are insufficient.
- 2026-06-06 command status: `bun run verify:final-surface-parity` now consumes
  exact-authorship proof and compares full-grid local final terrain, biome,
  feature, and resource surfaces against direct-control live readback through
  `getCiv7FullMapGrid`. Rivers/floodplains/wonders are explicit residual rows;
  starts remain a direct-control readback limitation until a canonical live
  start-surface wrapper exists. Studio live status is currently tuner-ready,
  and the setup player-count exact-authorship blocker was repaired by reading
  direct-control setup `config.playerCount`.
- 2026-06-06 full-grid proof result: request
  `studio-run-in-game-mq20rbzr-1fhc`, seed `138503614`, dimensions `106x66`,
  config hash
  `c8bf167810f92f9a6096b298d1fcf3bb6b044a0fec22a9ad0ca9b35103982dca`,
  envelope hash
  `a9a7bb73e9dd062e1da658a639bc02602e75b7fda1ca6d88123a1a2e9ac5f790`.
  The verifier read bounds `0,0,106,66` in 17 chunks, compared 6,996 plots,
  omitted 0 plots, and kept live seed/dimensions/turn/game-hash identity stable.
  Biome parity passed (`0/6996` mismatches). Terrain (`2/6996`), feature
  (`5/6996`), and resource (`106/6996`) mismatches remain unresolved. Terrain
  is observed as coast/ocean edge swaps and routed to terrain-policy
  diagnostics for source-authority classification. Feature and resource rows
  are observed as live/local legality, placement, or footprint deltas and
  routed to `earthlike-live-feature-resource-legality-repair` for
  source-authority classification before repair.
- 2026-06-09 river readback update: `earthlike-visible-river-acceptance`
  classified rivers as separate proof classes. Civ runtime reports
  `RiverTypes.NO_RIVER=-1`, `RIVER_MINOR=0`, and `RIVER_NAVIGABLE=1`; a sampled
  live map had `TERRAIN_NAVIGABLE_RIVER` tiles with zero `GameplayMap.isRiver` /
  `isNavigableRiver` tiles. Studio parity must therefore compare projected
  navigable terrain, raw terrain row, and Civ river metadata independently.
  The direct-control `hydrology` field now includes `riverType`, `river`, and
  `navigableRiver` runtime facts for that comparison.
