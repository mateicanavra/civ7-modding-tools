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

## Source Anchors

- USGS Water Science School, [Watersheds and Drainage Basins](https://www.usgs.gov/water-science-school/science/watersheds-and-drainage-basins)
- USGS, [Lakes and Reservoirs](https://www.usgs.gov/water-science-school/science/lakes-and-reservoirs)
- USGS, [Salinity and hydrology of closed lakes](https://pubs.usgs.gov/publication/pp412)
- American Meteorological Society Glossary, [rain shadow](https://glossary.ametsoc.org/wiki/rain-shadow/)
- NOAA Climate.gov, [Rain Shadows on the Summits of Hawaii](https://prod-01-asg-www-climate.woc.noaa.gov/news-features/featured-images/rain-shadows-summits-hawaii)

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
- `test/placement/placement-lake-readback.test.ts`
  - final readback catches accepted lakes that later dry out or lose lake
    classification after engine maintenance.
- `test/hydrology-knobs.test.ts`
  - validates the cause/projection separation between Hydrology river density,
    map-rivers navigable projection density, and lakeiness.
