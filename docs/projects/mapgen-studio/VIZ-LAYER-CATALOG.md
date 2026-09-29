# Status: Project doc (MapGen Studio)

This page is a project-local catalog and may drift.
It is **not** canonical MapGen visualization documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

# VIZ Layer Catalog — MapGen Studio

## Purpose
This catalog documents the visualization layers that MapGen Studio surfaces from the MapGen pipeline. It is the canonical reference for layer IDs, groups, and visibility defaults.

## Conventions
- **Layer IDs are stable.** Use dot-delimited IDs (e.g., `hydrology.hydrography.discharge`).
- **Groups reflect pipeline stages** (`Foundation`, `Morphology`, `Hydrology`, `Ecology`, `Gameplay`).
- **Visibility defaults:** internal/debug layers are hidden by default but remain selectable; user toggles should not strand selection.
- **Gameplay label:** placement layers are labeled “Gameplay” in UI only (no domain rename).
- **Mocks:** where engine-owned data is unavailable, pipeline-owned projections are used; non-1:1 mocks include inline code comments.

## Foundation
(Existing layers documented in code; see foundation step emitters.)

## Morphology
**Pipeline artifacts**
- `morphology.topography.elevation`
- `morphology.topography.landMask`
- `morphology.topography.bathymetry`
- `morphology.routing.flowDir` (debug)
- `morphology.routing.flowAccum`
- `morphology.routing.basinId` (debug)
- `morphology.substrate.erodibilityK`
- `morphology.substrate.sedimentDepth`
- `morphology.coastlineMetrics.coastalLand`
- `morphology.coastlineMetrics.coastalWater`
- `morphology.coastlineMetrics.distanceToCoast`
- `morphology.landmasses.landmassIdByTile`
- `morphology.volcanoes.volcanoMask`
- `morphology.volcanoes.points`

**Map‑morphology projections (pipeline‑owned mocks)**
- `map.morphology.mountains.mountainMask`
- `map.morphology.mountains.hillMask`
- `map.morphology.mountains.orogenyPotential`
- `map.morphology.mountains.fracturePotential`
- `map.morphology.coasts.coastalLand`
- `map.morphology.coasts.coastalWater`
- `map.morphology.volcanoes.points`

## Hydrology
**Climate & cryosphere**
- `hydrology.climate.rainfall`
- `hydrology.climate.humidity`
- `hydrology.climate.seasonality.rainfallAmplitude`
- `hydrology.climate.seasonality.humidityAmplitude`
- `hydrology.wind.windU` (debug)
- `hydrology.wind.windV` (debug)
- `hydrology.current.currentU` (debug)
- `hydrology.current.currentV` (debug)
- `hydrology.climate.indices.surfaceTemperatureC`
- `hydrology.climate.indices.pet`
- `hydrology.climate.indices.aridityIndex`
- `hydrology.climate.indices.freezeIndex`
- `hydrology.cryosphere.snowCover`
- `hydrology.cryosphere.seaIceCover`
- `hydrology.cryosphere.albedo`
- `hydrology.cryosphere.groundIce01`
- `hydrology.cryosphere.permafrost01`
- `hydrology.cryosphere.meltPotential01`
- `hydrology.climate.diagnostics.rainShadowIndex` (debug)
- `hydrology.climate.diagnostics.continentalityIndex` (debug)
- `hydrology.climate.diagnostics.convergenceIndex` (debug)

**Hydrography**
- `hydrology.hydrography.runoff`
- `hydrology.hydrography.discharge`
- `hydrology.hydrography.riverClass`
- `hydrology.hydrography.sinkMask`
- `hydrology.hydrography.outletMask`
- `hydrology.hydrography.basinId` (debug, optional; not emitted in current pipeline)

**Map‑hydrology projections (pipeline‑owned mocks)**
- `map.hydrology.rivers.riverClass`
- `map.hydrology.rivers.discharge`
- `map.hydrology.lakes.sinkMask`
- `map.hydrology.lakes.outletMask`

## Ecology
- `ecology.biome.biomeIndex`
- `ecology.biome.vegetationDensity`
- `ecology.biome.effectiveMoisture`
- `ecology.biome.surfaceTemperature`
- `ecology.biome.aridityIndex`
- `ecology.biome.freezeIndex`
- `ecology.biome.groundIce01`
- `ecology.biome.permafrost01`
- `ecology.biome.meltPotential01`
- `ecology.biome.treeLine01`
- `ecology.pedology.soilType`
- `ecology.pedology.fertility`
- `ecology.resourceBasins.resourceBasinId` (derived grid; 1..N basin ids)
- `ecology.featureIntents.featureType` (points; values map to FEATURE_PLACEMENT_KEYS)

## Gameplay (Placement)
- `placement.landmassRegions.regionSlot` (grid; 0=none, 1=west, 2=east)
- `placement.starts.sectorId` (grid; derived start-sector ids, 0=inactive)
- `placement.starts.startPosition` (points; player index)
