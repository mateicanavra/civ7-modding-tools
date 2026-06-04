# Corpus And Expectations

Use this reference when building the domain corpus and expected behavior model.

## Corpus Sources

Prefer official and local authority sources before current implementation:

- official Civ7 resources under `.civ7/outputs/resources/**`;
- repo-owned source constants, schemas, recipe configs, and operation catalogs;
- accepted project baselines, ADRs, and OpenSpec specs;
- generated output and runtime logs only as evidence, not source authority.

For Civ7 examples (concrete paths under
`.civ7/outputs/resources/Base/modules/base-standard/`):

- resources: `data/resources.xml` and `data/resources-v2.xml`;
- features, biomes, terrain, natural wonders: `data/terrain.xml` holds
  `Features`, `FeatureClasses`, `Feature_ValidTerrains`, `Feature_ValidBiomes`,
  `Feature_NaturalWonders`, `Biomes`, and `Biome_ValidTerrains`;
- biome/feature generation logic: `maps/feature-biome-generator.js`;
- yields/effects: the `*_YieldChanges` and `Feature_CityYields` tables in the
  same `data/` directory;
- brushing/stamping: adapter methods, `TerrainBuilder` surfaces, projection
  steps, and readback APIs (no official "brush" catalog exists; see the action
  corpus shape below);
- ecology: sub-corpora for pedology, biomes, feature families, and projection.

Corpus completeness is the first gate, not an assumption. The extraction under
`.civ7/outputs/` currently materializes only the `resources/` tree at top level,
even though that tree nests the full `base-standard` data above. If no extracted
corpus exists for the domain you are working (or the official tables are only
reachable through a nested path), **the first corpus task is to produce a clean
extraction** — name the source XML/JS, the extraction command, and the output
path convention (e.g. extend `.civ7/outputs/<domain>/`) before any grouping or
tuning. A domain with no enumerated corpus has not passed gate 4.

## Corpus Row Contract

Each row should record:

- canonical name and stable key;
- numeric ID, enum value, action name, or materialization surface;
- source path and authority class;
- current implementation coverage;
- grouped slice;
- placeability/applicability or action legality;
- blocked/proxy/unverified status;
- uncertainty and required proof.

Static official file order does not prove runtime numeric ID order. Runtime IDs
need runtime evidence.

## Expectation Row Contract

Each row or group should record:

- physical, ecological, earthlike, gameplay, surface-legality, readback, or
  effect-matrix baseline;
- expected range, categorical outcome, or legality rule;
- conditions where the expectation applies;
- expected stats/proof surface;
- evidence strength;
- known exceptions;
- implementation strategy owner.

Use exact values only when the evidence justifies them. Otherwise use ranges,
bands, binary legality gates, or confidence labels.

## Future-Domain Examples

| Domain | Corpus Shape | Baseline | Proof Shape |
| --- | --- | --- | --- |
| Resources | Official resource rows | geology, hydrology, climate, terrain, biome, feature legality | per-resource planned/placed/rejected counts and runtime catalog mapping |
| Features | Official feature rows and validity tables | habitat, terrain, biome, latitude, water adjacency | per-feature eligibility, family spread, runtime feature readback |
| Biomes | Official biome rows and local classifiers | temperature, rainfall, elevation, land/water, rain shadow | area by climate band and projection/readback parity |
| Terrain/tile types | official terrain rows and local constants | elevation, slope, coast/ocean, tectonics, hydrology | terrain histogram, water drift, post-materialization readback |
| Brushing/stamping | action surfaces and mutation targets | legality of the target surface | before/after diff, idempotence, readback, no hidden random gates |
| Trees/woodlands | filtered feature corpus | moisture, temperature, biome, drainage, competition | vegetation-type density and overlap checks |
| Wetlands | filtered feature corpus and hydromorphic masks | drainage, lowland hydrology, river/lake/coast adjacency, biome | habitat eligibility, wet/vegetated overlap, runtime feature readback |
| Natural wonders | feature rows and natural-wonder shape/validity tables | landform, adjacency, terrain, biome, tile shape | eligibility, placement outcome/rejection, multi-tile readback |
| Yield/effect matrices | terrain/biome/feature yield and effect tables | matrix completeness and gameplay legality | missing/duplicate combinations, age/DLC deltas, generated XML/runtime verification |

## Worked Example: A Non-Distribution Expectation

Not every domain proves correctness with a distribution. For legality- or
eligibility-shaped domains (features, brushing, natural wonders), predeclare a
binary/categorical expectation and prove it with eligibility and before/after
checks, not spread statistics. Example for the `FEATURE_FLOODPLAIN_*` family:

- **Baseline (physical):** floodplains form only on flat land adjacent to a
  river; never on desert-only or ocean tiles; never on slope/hill/mountain.
- **Predeclared expectation:** for every floodplain feature, eligibility is
  `true` only where `isFlat && adjacentToRiver`; expected count on
  desert-without-river and on ocean tiles is exactly `0`; eligible-tile fill
  rate falls in a declared band (e.g. 0.4–0.7 of eligible river tiles).
- **Proof shape:** per-feature eligibility mask coverage; a hard gate asserting
  `0` placements outside the legal mask; a before/after diff over stable seeds;
  runtime feature readback via `GameplayMap.getFeatureType` for one bounded
  sample.
- **Why not distribution stats:** "even spread across the map" is the wrong
  expectation here — a floodplain that is evenly spread is *wrong*. The legality
  gate is the proof; the fill-rate band is a secondary sanity check, not the
  primary claim.

Use this pattern whenever the domain has a binary legality rule. Use the
resource-style distribution pattern only when even/weighted spread is itself the
correctness claim.
