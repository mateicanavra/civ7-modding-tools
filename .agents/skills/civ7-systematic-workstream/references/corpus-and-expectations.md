# Corpus And Expectations

Use this reference when building the domain corpus and expected behavior model.

## Corpus Sources

Prefer official and local authority sources before current implementation:

- official Civ7 resources under `.civ7/outputs/resources/**`;
- repo-owned source constants, schemas, recipe configs, and operation catalogs;
- accepted project baselines, ADRs, and OpenSpec specs;
- generated output and runtime logs only as evidence, not source authority.

For Civ7 examples:

- resources: `Base/modules/base-standard/data/resources.xml` and
  `resources-v2.xml`;
- features, biomes, terrain, natural wonders, and yields: official terrain and
  feature/yield tables plus local stage artifacts;
- brushing/stamping: adapter methods, `TerrainBuilder` surfaces, projection
  steps, and readback APIs;
- ecology: sub-corpora for pedology, biomes, feature families, and projection.

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
