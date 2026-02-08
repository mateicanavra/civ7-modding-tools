# CURRENT: Ecology Domain (As Implemented)

This document is a grounded mental map of how ecology is currently structured and how it relates to upstream/downstream pipeline stages.

## Where Ecology Lives

- Domain ops + shared semantics:
  - `mods/mod-swooper-maps/src/domain/ecology/**`
- Standard recipe stages/steps (truth + projection):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`

## Pipeline Position

Standard recipe ordering (relevant slice):
- `hydrology-climate-baseline` -> `hydrology-hydrography` -> `hydrology-climate-refine` -> `ecology` -> `map-morphology` -> `map-hydrology` -> `map-ecology` -> `placement`

Anchors:
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

## Stage: `ecology` (Truth)

Stage definition:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`

Step order (current):
1. `pedology`
2. `resource-basins`
3. `biomes`
4. `biome-edge-refine`
5. `features-plan`

### Step: `pedology`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
- Reads artifacts:
  - `artifact:morphology.topography`
  - `artifact:climateField`
- Calls op:
  - `ecology.ops.classifyPedology`
- Publishes:
  - `artifact:ecology.soils`
- Viz:
  - `ecology.pedology.soilType` (grid)
  - `ecology.pedology.fertility` (scalar variants)

### Step: `resource-basins`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
- Reads artifacts:
  - `artifact:ecology.soils`
  - `artifact:morphology.topography`
  - `artifact:climateField`
- Calls ops:
  - `ecology.ops.planResourceBasins` then `ecology.ops.scoreResourceBasins`
- Publishes:
  - `artifact:ecology.resourceBasins`
- Viz:
  - `ecology.resourceBasins.resourceBasinId` (grid u16)

### Step: `biomes`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
- Reads artifacts:
  - `artifact:climateField`
  - `artifact:hydrology.cryosphere`
  - `artifact:morphology.topography`
  - `artifact:hydrology.hydrography`
- Calls op:
  - `ecology.ops.classifyBiomes`
- Publishes:
  - `artifact:ecology.biomeClassification`
- Viz (fields and scalar variants):
  - `ecology.biome.vegetationDensity`
  - `ecology.biome.effectiveMoisture`
  - `ecology.biome.surfaceTemperature`
  - `ecology.biome.aridityIndex`
  - `ecology.biome.freezeIndex`
  - `ecology.biome.groundIce01`
  - `ecology.biome.permafrost01`
  - `ecology.biome.meltPotential01`
  - `ecology.biome.treeLine01`

### Step: `biome-edge-refine`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts`
- Reads artifacts:
  - `artifact:ecology.biomeClassification`
  - `artifact:morphology.topography`
- Calls op:
  - `ecology.ops.refineBiomeEdges`
- Output behavior:
  - Mutates `biomeIndex` in the previously published biome classification artifact in-place.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`
- Viz:
  - `ecology.biome.biomeIndex` (categorical grid)

### Step: `features-plan`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
- Reads artifacts:
  - `artifact:ecology.biomeClassification`
  - `artifact:ecology.soils`
  - `artifact:hydrology.hydrography`
  - `artifact:morphology.topography`
- Calls ops (declared in contract):
  - `planVegetation`, `planWetlands`, `planReefs`, `planIce`
- Also optionally calls richer placement ops via a direct domain import (drift):
  - `planVegetatedFeaturePlacements`, `planWetFeaturePlacements`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
- Publishes:
  - `artifact:ecology.featureIntents`
- Viz:
  - `ecology.featureIntents.featureType` (points categorical)

## Stage: `map-ecology` (Projection / Engine)

Stage definition:
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`

Step order (current):
1. `plot-biomes`
2. `features-apply`
3. `plot-effects`

### Step: `plot-biomes`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
- Reads artifacts:
  - `artifact:ecology.biomeClassification`
  - `artifact:morphology.topography`
- Adapter writes:
  - sets engine biome type, writes `field:biomeId` and `field:temperature` buffers.
- Provides:
  - `field:biomeId`
  - `effect:engine.biomesApplied`
- Viz:
  - `map.ecology.biomeId`
  - `map.ecology.temperature`

### Step: `features-apply`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
- Reads artifacts:
  - `artifact:ecology.featureIntents`
- Calls op:
  - `ecology.ops.applyFeatures` (merge/filter placements)
- Adapter writes:
  - attempts placements gated by `adapter.canHaveFeature`, then reifies engine field buffer.
- Provides:
  - `field:featureType`
  - `effect:engine.featuresApplied`
- Viz:
  - `map.ecology.featureType`
  - debug overlays: `debug.heightfield.terrain`, `debug.heightfield.landMask`

### Step: `plot-effects`

- Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
- Reads artifacts:
  - `artifact:ecology.biomeClassification`
  - morphology heightfield via `context.buffers.heightfield`
- Calls op:
  - `ecology.ops.planPlotEffects`
- Adapter writes:
  - applies plot effects via `context.adapter.addPlotEffect`.
- Provides:
  - none (no effect tag modeled today)
- Viz:
  - `map.ecology.plotEffects.plotEffect` (points)
