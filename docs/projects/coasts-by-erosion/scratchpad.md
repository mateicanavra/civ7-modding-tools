# Scratchpad: Civ7 Coasts + Real-World Analogue

## What "Coast" Means In Civ7 (Semantics)
- Civ7 distinguishes water terrains: `TERRAIN_COAST` (shallow) vs `TERRAIN_OCEAN` (deep).
- Both are `Water="true"` in the base terrain table.
- Terrain order is hard-coded into gamecore indices:
  - `TERRAIN_MOUNTAIN`, `TERRAIN_HILL`, `TERRAIN_FLAT`, `TERRAIN_COAST`, `TERRAIN_OCEAN`, `TERRAIN_NAVIGABLE_RIVER`.

Relevant sources:
- `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`

## What Coast Tiles Do (Gameplay Surface Area)
- Resource placement: several Marine resources are explicitly `TerrainType="TERRAIN_COAST"` (e.g. `RESOURCE_CRABS`, `RESOURCE_COWRIE`, `RESOURCE_TURTLES`).
- Feature placement: reefs are valid on `TERRAIN_COAST` (and appear keyed as such in base data).
- City/building/wonder rules: multiple data rows key off adjacency to `TERRAIN_COAST` or presence of `TERRAIN_COAST` in a city.

Relevant sources:
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources-v2.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`

## How Official Scripts Produce Coasts (Mechanics)
- The base-standard helper `expandCoasts(width,height)` is *not* "make shoreline coast"; it is "scatter additional shallow water out from existing shallow water".
- `checkExpandCoast(x,y)` only runs on tiles whose current terrain is `g_OceanTerrain` and flips some of them to `g_CoastTerrain` if adjacent to an existing coast tile (random `1/4` gate).
- This implies a two-stage posture:
  - Some earlier step (often `TerrainBuilder.validateAndFixTerrain()` in official scripts) ensures a coherent baseline shoreline/coast state.
  - `expandCoasts` then widens that shallow-water band stochastically.

Relevant sources:
- `.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/continents.js` (call ordering: `validateAndFixTerrain()` -> `expandCoasts()` -> ...)

## Our Desired Equivalent (Truth-Driven, No Civ ExpandCoasts)
Goal: `TERRAIN_COAST` should reflect *our* coastline geometry (after erosion / fjord/bay carving), not Civ's stochastic widening.

In our pipeline:
- Morphology truth decides land/water via `artifact:morphology.topography.landMask`.
- `morphology-mid/rugged-coasts` computes:
  - `artifact:morphology.coastlineMetrics.coastalWater`: water tiles adjacent to land (our "shallow water band").
  - `artifact:morphology.coastlineMetrics.coastalLand`: land tiles adjacent to water.
  - Coastline carving (bays/fjords) is plate-aware (boundary type + boundary closeness).
- `map-morphology/plot-coasts` should project:
  - land (`landMask=1`) -> `TERRAIN_FLAT`
  - coastal water (`landMask=0` and `coastalWater=1`) -> `TERRAIN_COAST`
  - deep water (`landMask=0` and `coastalWater=0`) -> `TERRAIN_OCEAN`

Relevant sources:
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/strategies/default.ts` (plate-aware carving + masks)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts` (publishes coastlineMetrics)
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.ts` (projection)

## Real-World Analogue (Why Coasts Form Where They Do)
High-level mapping:
- The "coastline" is the intersection of sea level with topography, modified by erosion/deposition and long-term tectonics.
- "Coastal waters" (shallow seas) correspond most closely to the continental shelf and shallow nearshore bathymetry.

Key processes (very simplified):
- Sea level sets the land/water boundary (our hypsometry step is the analog).
- Wave erosion and sediment transport shape bays, headlands, barrier islands, and deltas (our coastline carving / ruggedness knobs are a stylized analog).
- Plate context influences shoreline roughness and shelf morphology:
  - Active margins (subduction/transform) tend to have rugged coasts and narrower shelves.
  - Passive margins (divergent) tend to have wider shelves and smoother coastlines.
- Fjords are typically glacially carved valleys later flooded by sea level rise. In our model, "fjord carving" is a stylistic proxy driven by active-margin context.

How this ties to our model knobs/drivers:
- `foundation/crust` has explicit shelf-related parameters (e.g. `shelfWidthCells`, `shelfElevationBoost`) that influence coastal topography prior to sea-level selection.
- `compute-coastline-metrics` uses `boundaryType` and `boundaryCloseness` as a proxy for active vs passive margins (affecting bay/fjord odds).

## Observed Drift Category To Watch
Any engine-side helper that can mutate Civ's land/water classification (`GameplayMap.isWater`) after we've committed Morphology truth can cause "no-water-drift" failures.

Known/likely candidates in our pipeline:
- `TerrainBuilder.validateAndFixTerrain()` (may adjust terrain classifications for validity).
- `TerrainBuilder.buildElevation()` (may trigger internal terrain fixups).
- `generateLakes()` (explicitly converts land plots to `TERRAIN_COAST` in official code; that is a land->water flip).

Practical guardrail:
- Steps that call engine helpers should either:
  - treat the engine output as "gameplay-only" and never compare against Morphology truth, or
  - explicitly sync back the mutated water mask into a dedicated "runtime map state" buffer and keep Morphology truth immutable.

## Possible Future Upgrade (More Geological Than 1-Tile Adjacency)
Adjacency is a good Civ-compatible baseline ("coast = water next to land"), but it's not the only plausible interpretation of shallow water.

If we want shelves to matter more:
- Define a bathymetry-derived "shallow water" threshold (e.g. `bathymetry >= -X`) and stamp `TERRAIN_COAST` for shallow water tiles, not just adjacent tiles.
- Make `X` (or an equivalent shaping curve) depend on shelf drivers (passive vs active margin, crust shelf width, sedimentation).
- Keep it deterministic and derived from Morphology truth to avoid drift.
