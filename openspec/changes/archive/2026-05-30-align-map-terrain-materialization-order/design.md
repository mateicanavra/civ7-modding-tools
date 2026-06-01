# Design: Map Terrain Materialization Order

## Problem

`TerrainBuilder.buildElevation()` is an engine-owned terrain shaping pass. In Firaxis' standard scripts, it runs after mountains/volcanoes and lake generation, and before hills/rainfall/river modeling. The current Swooper order runs elevation before lake projection. When the engine shapes elevation before the final static water body surface exists, later lake stamping can produce visually incoherent basins, and terrain restoration after drift cannot repair engine-owned elevation/cliff state.

## Owner Shape

- Morphology truth remains upstream and owns topography, coastline, mountain, volcano, and landmass intent.
- Hydrology truth remains upstream and owns lake and river intent.
- Map projection stages own engine mutation and readback only.
- The stage order, not a helper shim, owns cross-surface engine sequencing.

## Standard Sequence

The standard recipe must keep this gameplay projection order:

1. `map-morphology`: project static morphology terrain surfaces (coasts, continents, mountains, volcanoes).
2. `map-hydrology`: project static hydrology water bodies (lakes) from Hydrology lake intent.
3. `map-elevation`: run engine elevation shaping after static land/water terrain exists.
4. `map-rivers`: model engine rivers after elevation exists.
5. `map-ecology`: apply biome/feature projection.
6. `placement`: apply gameplay placements.

This uses separate stage owners because lakes, elevation, and rivers have different engine lifecycle semantics. It does not create a generic shared bucket: each stage contains the projection step that owns one materialization responsibility.

## Guard

The map stamping guard must assert recipe-node order, not only caller location:

- `map-hydrology/lakes` precedes `map-elevation/build-elevation`.
- `map-elevation/build-elevation` precedes `map-rivers/plot-rivers`.
- `adapter.buildElevation(...)`, `adapter.stampLakes(...)`, and `adapter.modelRivers(...)` remain behind their dedicated projection steps.
- `map-elevation/build-elevation` depends on the `effect:map.lakesPlotted`
  lifecycle effect, not on the lake readback/parity evidence tag.

## Verification

- OpenSpec strict validation for this change.
- Config schema tests for shipped maps and presets.
- Map stamping contract guard.
- Focused hydrology/map projection tests.
- World-balance stats gates.
- Package check, repo build, deploy, and FireTuner/log restart proof.
