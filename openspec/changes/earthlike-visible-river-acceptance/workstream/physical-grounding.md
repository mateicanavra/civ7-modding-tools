# Physical Grounding

Date: 2026-06-09

This note records the Earth-hydrology expectations used to design the visible
river/lake repair tests. The implementation intentionally uses lightweight game
abstractions, but these are the physical constraints the abstractions must keep
true.

## Hydrology Expectations

- **Watersheds are the basic unit.** Runoff from land upstream of a point feeds
  the streamflow at that point, so routing must be a basin graph, not independent
  per-tile noise. In tests, every land route must terminate at ocean, a sink, or
  an accepted planned lake, and discharge must not decrease across land-to-land
  receivers.
- **Confluences accumulate water.** Larger downstream rivers are explained by
  upstream drainage and tributary contribution. In tests, tributary fixtures
  assert increasing discharge through confluence and outlet tiles.
- **Mountains shape rainfall.** Orographic barriers create windward/leeward
  precipitation contrasts and rain shadows. In tests, the rain-shadow fixture
  expects stronger windward rivers than dry leeward slopes under the same base
  routing topology.
- **Closed basins are real, not bugs.** Endorheic/terminal basins do not drain
  to the ocean; their water balance is governed by inflow, evaporation,
  seepage, and basin geometry. In tests, closed basins may become lakes or stay
  arid/endorheic without forcing impossible ocean outlets.
- **Knobs decouple causes from projections.** Hydrology `riverDensity` changes
  physical river classification thresholds; `map-rivers.navigableRiverDensity`
  changes the Civ-visible trunk subset after terrain projection; `lakeiness`
  changes accepted lake persistence without moving drainage divides.

## Benchmark Contract

Hydrology benchmark rows use a declared contract before local tuning:

| Field | Expectation | Uncertainty marker |
| --- | --- | --- |
| Tile scale | Civ tiles are coarse strategy-scale samples; same-run reports must carry dimensions and any latitude assumption before translating tile counts to kilometers. | Do not compare tile counts directly to meter-scale Earth pixels. |
| Visible feature floor | Hydrology can publish hidden drainage, minor/headwater channels, and major trunks; Civ terrain projection is only the visible navigable subset. | `TERRAIN_NAVIGABLE_RIVER` terrain proof does not prove minor metadata. |
| Regime row | Benchmarks are interpreted as `wet`, `normal`, `arid`, `mountain`, `closed`, `archipelago`, or an explicit extension. | Arid/no-visible outcomes are only valid with matching regime evidence. |
| Stylization ledger | Any exaggeration, merging, omission, or engine-native substitution records source anchor, affected metric, reason, product claim, and proof gate. | Silent stylization cannot close product acceptance. |

Hydrology `artifact:hydrology.riverNetworkMetrics.benchmarkSummary` is the
observed generated-map summary for this contract: class ratios, river-specific
permanence, low-order hierarchy, terminal shares, lake share, basin coverage,
and routing-health counters. Projection plans, live terrain readback, Civ river
metadata, Studio layer status, screenshots, and product verdicts are separate
proof classes.

## External Earth Anchors

- **Coarse routed network.** HydroRIVERS maps rivers with catchment area
  `>=10 km2` or average flow `>=0.1 m3/s`; its product page reports 8.5
  million reaches averaging 4.2 km and 35.9 million km globally. Treat this as
  a coarse mapped-network floor, not as all drainage truth.
- **Threshold uncertainty.** Global vector hydrography literature notes the
  HydroRIVERS threshold is empirical, so generated-map acceptance must preserve
  topology/regime ordering and avoid one global magic threshold.
- **Visible rivers.** GRWL measures rivers `>=30 m` wide and covers more than
  2.1 million km of centerlines. It anchors visible wide-river expectations,
  not minor/headwater drainage.
- **Flow permanence.** Global modeling estimates that 51-60% of river length is
  non-perennial. Non-perennial and ephemeral outcomes must remain first-class
  Hydrology results.
- **Lakes.** HydroLAKES reports about 1.4 million lakes/reservoirs totaling
  2.67 million km2. Lake abundance should be judged against a declared visible
  lake floor and regime row.

## Source Anchors

- USGS Water Science School, [Watersheds and Drainage Basins](https://www.usgs.gov/water-science-school/science/watersheds-and-drainage-basins)
- USGS, [Lakes and Reservoirs](https://www.usgs.gov/water-science-school/science/lakes-and-reservoirs)
- USGS, [Salinity and hydrology of closed lakes](https://pubs.usgs.gov/publication/pp412)
- American Meteorological Society Glossary, [rain shadow](https://glossary.ametsoc.org/wiki/rain-shadow/)
- NOAA Climate.gov, [Rain Shadows on the Summits of Hawaii](https://prod-01-asg-www-climate.woc.noaa.gov/news-features/featured-images/rain-shadows-summits-hawaii)
- HydroSHEDS, [HydroRIVERS](https://www.hydrosheds.org/products/hydrorivers)
- Lin et al., [A new vector-based global river network dataset accounting for
  variable drainage density](https://www.nature.com/articles/s41597-021-00819-9)
- Allen and Pavelsky, [Global extent of rivers and
  streams](https://www.science.org/doi/10.1126/science.aat0636)
- Messager et al., [Global prevalence of non-perennial rivers and
  streams](https://pubmed.ncbi.nlm.nih.gov/34135525/)
- HydroSHEDS, [HydroLAKES](https://www.hydrosheds.org/products/hydrolakes)

## Test Mapping

- `test/hydrology-physical-benchmarks.test.ts`
  - tilted island coastal outlets: basin routes terminate at ocean outlets;
  - central ridge: drainage divides remain separate;
  - tributary confluence: discharge accumulates downstream;
  - low-gradient coastal plain: broad minor channels can feed a major trunk;
  - closed basin and saddle/lake-chain fixtures: accepted lakes terminate
    drainage, while spill paths route downstream;
  - rain-shadow coast: windward runoff exceeds leeward runoff;
  - arid plateau: valid routing alone is not enough to force river projection;
  - water-supply/topology and lakeiness/topology fixtures: knobs change supply
    or lake acceptance without moving drainage topology.
- `test/hydrology/river-network-metrics.test.ts`
  - river-network summary fixtures assert accepted-lake, spill-path, hierarchy,
    permanence, basin coverage, invalid receiver, discharge-drop, and unresolved
    terminal counters.
- `test/pipeline/hydrology-river-network-metrics.test.ts`
  - representative generated-map rows assert nonzero minor/major river classes,
    river permanence accounting, no invalid receivers, no discharge drops,
    assigned basin coverage, and arid controls.
- `test/placement/placement-lake-readback.test.ts`
  - final readback catches accepted lakes that later dry out or lose lake
    classification after engine maintenance.
- `test/hydrology-knobs.test.ts`
  - validates the cause/projection separation between Hydrology river density,
    map-rivers navigable projection density, and lakeiness.
