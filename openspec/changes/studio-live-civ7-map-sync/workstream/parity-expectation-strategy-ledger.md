# Parity Expectation And Strategy Ledger

| Corpus row/group | Expected behavior | Condition | Evidence strength | Architecture owner | Strategy/artifact | Local stats gate | Runtime proof | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| coordinate/display | Row-major odd-q data is stable; visual transforms are explicit and reversible | all artifacts and Studio views | high | mapgen-core artifacts; mapgen-studio renderer | declared `tile.hexOddQ` space plus Studio projection tests | zero coordinate mismatches on sample fixtures | live readback index probes and Studio tile-pick probes | implemented, still needs visual projection gate |
| terrain/coast/lake | Pipeline terrain truth survives projection except where engine legality is deliberately recorded | after `map-morphology`, `map-hydrology`, `map-elevation`, `map-rivers`, placement final | high for authored terrain, medium for engine side effects | standard recipe map stages and civ7-adapter | stage snapshots plus final engine terrain snapshot | classify all terrain mismatches by operation and mask | full-grid terrain readback after fresh CLI run | proposed |
| elevation | Engine elevation side effects are captured and either emulated or made non-generative | after `TerrainBuilder.buildElevation()` | medium | `map-elevation` projection step | pre/post elevation drift artifact | bounded drift counts with reasons | log plus live terrain/elevation readback if exposed | proposed |
| rivers | Planned minor intent, planned major intent, projected navigable terrain, raw river terrain, and Civ river metadata are compared as separate proof classes | after `map-rivers` | medium-high for terrain projection, medium for metadata until minor authoring is proven | hydrology truth plus `map-rivers` projection and adapter readback | planned minor mask, planned major mask, projected navigable mask, raw terrain mask, any-river mask, navigable metadata mask, minor metadata mask, mismatch mask | projected-vs-readback deltas classified by planned class, terrain row, and metadata | live terrain, `getRiverType`, `isRiver`, and `isNavigableRiver` readback | proposed |
| biomes | Biome ids match exactly | after `plotBiomes` and placement final | high | ecology-biomes and map-ecology projection | final engine biome snapshot | zero full-grid mismatches | live full-grid biome readback | measured passing on one seed |
| features | Planned ecology features are placed only where live legality allows, with rejected tiles recorded | after `features-apply` | high for official validity, medium for hidden engine state | ecology-features and adapter legality | official validity helper plus runtime rejection telemetry | zero hard mismatches; accepted `canHaveFeature=false` deltas attributed | live feature readback and `FEATURE_APPLY_V1` telemetry | proposed |
| resources | Planned resources reconcile against active age, runtime catalog, and live legality before placement | after placement resources | high | placement resource operation and adapter legality | candidate legality matrix and placement outcome artifact | local planned/placed/rejected equals live telemetry | live resource readback and `RESOURCE_PLACEMENT_V1` telemetry | proposed |
| areas/starts/discoveries | Downstream placement consumers use final projected terrain/resource surfaces, not stale local truth | after placement final | medium | placement stage | final placement engine snapshot and readback wrappers | starts/discoveries stable across local/live final surfaces | live readback wrappers or bounded manual proof | pending |

## Notes

- Physical/ecological/gameplay baseline: exact map parity is a product goal, but
  the architectural mechanism is not to let Studio guess hidden engine results.
  Either port the deterministic legality/generator behavior into the adapter
  mock or move the final surface back into pipeline-owned truth.
- Known exceptions: unrelated UI mod errors in `output.log` are outside this
  workstream unless they block map generation or direct-control readback.
- Proxy gaps: `MockAdapter.buildElevation()` is a known proxy;
  `MockAdapter.readRiverProjection()` now mirrors Civ river-type sentinels and
  direct-control map `hydrology` readback exposes Civ `riverType`, `river`, and
  `navigableRiver` metadata facts, but neither surface can author minor river
  metadata. `MockAdapter.canHaveFeature()` and `MockAdapter.canHaveResource()`
  default too permissive without injected legality.
- Unassignable or not-applicable rows: none yet; if an engine operation cannot
  be predicted, the strategy becomes controlling/eliminating that operation as a
  generator rather than accepting a permanent Studio lie.
- Review findings: pending post-diagnosis review.
