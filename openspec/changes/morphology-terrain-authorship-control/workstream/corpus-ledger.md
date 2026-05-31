# Corpus Ledger

## Terrain Classes

| Key | Official source | Authorship/readback class | Current coverage | Required proof |
| --- | --- | --- | --- | --- |
| `TERRAIN_MOUNTAIN` | `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml` | Directly authorable by `TerrainBuilder.setTerrainType`; read by `GameplayMap.getTerrainType`/`isMountain`; Civ7 marks impassable | Morphology ridge mask and volcano/natural-wonder projection can stamp it | Planned ridge share, final non-volcano mountain share, volcano-stamped mountain separation, engine terrain readback |
| `TERRAIN_HILL` | same | Directly authorable terrain; Civ7 marks `Hills=true` | Current foothill mask under-authors it | Planned/final hill share, hill components, rough-land source attribution |
| `TERRAIN_FLAT` | same | Directly authorable/default terrain | Dominates Earthlike interiors | Flat budget and terrain-stage deltas after hydrology/projection |
| `TERRAIN_COAST` | same | Directly authorable water terrain; hydrology stamps lakes as coast | Coasts/lakes are projection and hydrology surfaces | Coast/shelf/lake readback and water/lake classification drift |
| `TERRAIN_OCEAN` | same | Directly authorable water terrain | Projection surface | Ocean/coast budget and shelf separation |
| `TERRAIN_NAVIGABLE_RIVER` | same | Engine/hydrology terrain mutation through river modeling; readback by terrain/hydrology APIs | Hydrology/engine-owned, not Morphology rough-land truth | River terrain readback after `modelRivers`; excluded from land roughness bands |

## Terrain-Linked Official Features

Source: `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`,
plus DLC terrain files listed below.

| Terrain | Feature keys |
| --- | --- |
| `TERRAIN_FLAT` | `FEATURE_SAGEBRUSH_STEPPE`, `FEATURE_OASIS`, `FEATURE_DESERT_FLOODPLAIN_MINOR`, `FEATURE_FOREST`, `FEATURE_MARSH`, `FEATURE_GRASSLAND_FLOODPLAIN_MINOR`, `FEATURE_SAVANNA_WOODLAND`, `FEATURE_WATERING_HOLE`, `FEATURE_PLAINS_FLOODPLAIN_MINOR`, `FEATURE_RAINFOREST`, `FEATURE_MANGROVE`, `FEATURE_TROPICAL_FLOODPLAIN_MINOR`, `FEATURE_TAIGA`, `FEATURE_TUNDRA_BOG`, `FEATURE_TUNDRA_FLOODPLAIN_MINOR`, `FEATURE_VALLEY_OF_FLOWERS`, `FEATURE_REDWOOD_FOREST`, `FEATURE_GRAND_CANYON` |
| `TERRAIN_HILL` | `FEATURE_GULLFOSS`, `FEATURE_IGUAZU_FALLS`, `FEATURE_ULURU` |
| `TERRAIN_MOUNTAIN` | `FEATURE_HOERIKWAGGO`, `FEATURE_KILIMANJARO`, `FEATURE_ZHANGJIAJIE`, `FEATURE_TORRES_DEL_PAINE`, `FEATURE_MOUNT_EVEREST`, `FEATURE_MACHAPUCHARE`, `FEATURE_MOUNT_FUJI`, `FEATURE_VIHREN`, `FEATURE_VINICUNCA` |
| `TERRAIN_COAST` | `FEATURE_REEF`, `FEATURE_COLD_REEF`, `FEATURE_ICE`, `FEATURE_LOTUS`, `FEATURE_BARRIER_REEF`, `FEATURE_THERA`, `FEATURE_GREAT_BLUE_HOLE`, `FEATURE_MAPU_A_VAEA_BLOWHOLES` |
| `TERRAIN_OCEAN` | `FEATURE_ICE`, `FEATURE_ATOLL`, `FEATURE_BERMUDA_TRIANGLE` |
| `TERRAIN_NAVIGABLE_RIVER` | `FEATURE_DESERT_FLOODPLAIN_NAVIGABLE`, `FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE`, `FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE`, `FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE`, `FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE` |

Natural-wonder add-on sources:

- `.civ7/outputs/resources/Base/modules/base-standard/data/marvelous-mountains-terrain.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/racetowonders-terrain.xml`
- `.civ7/outputs/resources/DLC/water-wonders/modules/data/terrain.xml`
- `.civ7/outputs/resources/DLC/mountain-natural-wonders/modules/data/terrain.xml`

Volcano-linked feature keys:

- `FEATURE_VOLCANO` is a standard feature with `PlacementClass="VOLCANO"`.
- `FEATURE_KILIMANJARO`, `FEATURE_THERA`, and `FEATURE_MOUNT_FUJI` carry
  volcano semantics through tags or random-event metadata.

## Downstream Resource Implications

Official resource legality in `resources.xml` and `resources-v2.xml` includes
these hill-dependent resources:

`RESOURCE_CAMELS`, `RESOURCE_COAL`, `RESOURCE_COFFEE`, `RESOURCE_FLAX`,
`RESOURCE_GOLD`, `RESOURCE_GYPSUM`, `RESOURCE_HARDWOOD`, `RESOURCE_IRON`,
`RESOURCE_IVORY`, `RESOURCE_LIMESTONE`, `RESOURCE_LLAMAS`,
`RESOURCE_MARBLE`, `RESOURCE_RUBIES`, `RESOURCE_SILVER`, `RESOURCE_TEA`,
`RESOURCE_TIN`, `RESOURCE_TRUFFLES`, `RESOURCE_WILD_GAME`, `RESOURCE_WOOL`.

Implication: near-zero hills is not only a terrain visual problem. It constrains
mining, pastoral, upland agricultural, and geological resource placement and
must trigger downstream resource-placement realignment.

## Morphology Truth Artifacts And Ops

| Surface | Class | Current source |
| --- | --- | --- |
| Land/water/topography/bathymetry | Direct Morphology truth | `morphologyArtifacts.topography` |
| Landmasses and landmass ids | Direct Morphology truth | `morphologyArtifacts.landmasses` |
| Coastline/shelf/distance-to-coast metrics | Derived Morphology truth | `morphologyArtifacts.coastlineMetrics` |
| Belt drivers: boundary closeness/type, uplift, collision, subduction, rift, stress, age | Foundation-derived Morphology truth | `morphologyArtifacts.beltDrivers` |
| Substrate: erodibility/sediment depth | Morphology truth | `morphologyArtifacts.substrate` |
| Flow routing and geomorphic cycle | Morphology truth/influence | `compute-flow-routing`, `compute-geomorphic-cycle` |
| Ridges and foothills | Morphology terrain intent | `plan-ridges`, `plan-foothills`, `morphologyArtifacts.mountains` |
| Volcanoes | Morphology point intent | `plan-volcanoes`, `morphologyArtifacts.volcanoes` |
| Island chains | Morphology terrain/topology intent | `plan-island-chains` |
| Rolling uplands/old highlands/plateaus/escarpments | Missing dedicated owner | Required downstream rough-land op |

## Projection And Hydrology Mutation

| Stage/step | Role | Proof requirement |
| --- | --- | --- |
| `map-morphology/plot-mountains` | Projects `mountainMask` and `hillMask` to engine terrain | Planned-vs-final terrain parity and drift |
| `map-morphology/plot-volcanoes` | Stamps volcano points as `TERRAIN_MOUNTAIN` plus `FEATURE_VOLCANO` | Count separately from ridge mountains |
| `map-hydrology` lake stamping | Mutates accepted lake mask to `TERRAIN_COAST` and water state | Lake mask/readback parity and water/lake drift |
| River modeling | Engine/hydrology mutation, including navigable river terrain | Terrain/hydrology readback after engine river calls |
| `map-elevation/build-elevation` | Calls `TerrainBuilder.buildElevation()` | Engine elevation/cliff readback; no Morphology truth claim |

## Engine APIs And Readback Surfaces

| Surface | Class | Notes |
| --- | --- | --- |
| `TerrainBuilder.setTerrainType` | Direct write | terrain classes only; no `setElevation` or `setCliff` |
| `TerrainBuilder.setBiomeType`, `setFeatureType`, `setRainfall`, `setLandmassRegionId`, plot tags | Direct write | downstream projection/materialization |
| `TerrainBuilder.validateAndFixTerrain`, `stampContinents`, `buildElevation`, `modelRivers`, `defineNamedRivers`, `storeWaterData` | Engine effect calls | must be treated as effect/readback boundaries |
| `GameplayMap.getTerrainType`, `getBiomeType`, `getFeatureType`, `getResourceType` | Runtime readback | direct-control plot/grid reads can capture these |
| `GameplayMap.getElevation`, `getRainfall`, `getTemperature`, `getRiverType` | Runtime readback | elevation exists only after engine build/readback |
| `GameplayMap.isWater`, `isLake`, `isMountain`, `isNavigableRiver`, `isNaturalWonder`, `isImpassable` | Runtime predicates | prove final engine classification |
| `GameplayMap.isCliffCrossing(x,y,direction)` | Runtime readback-only | not currently a first-class direct-control map field |

## Direct-Control Surface

| Path | Role | Status |
| --- | --- | --- |
| `civ7 game restart --begin --wait-tuner --json` | App UI lifecycle plus Begin Game boundary | Available; does not prove selected Studio config |
| `civ7 game status --json` | shared/App UI/Tuner readiness | Timed out locally with no ready tuner session |
| `civ7 game map --summary --json` | Tuner map summary | available after Begin/Tuner readiness |
| `civ7 game map --bounds ... --fields terrain,climate,hydrology,areaRegion --json` | bounded Tuner terrain/elevation/hydrology readback | no first-class cliffs yet |
| `civ7 game gameinfo Terrains/Biomes/Features/Resources --json` | runtime official row readback | available after Tuner readiness |
| `civ7 game catalog --static --json` | static package surface inventory | passed locally |
| Studio `/api/civ7/status`, `/map-summary`, `/gameinfo` | package-backed read endpoints | available, narrow; not setup/run-in-game proof |
