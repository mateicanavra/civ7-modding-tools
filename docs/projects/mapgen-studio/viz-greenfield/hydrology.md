# Hydrology — Viz v1 Greenfield Spec (Standard Recipe)

This document specifies the **intended** visualization surface for the **Hydrology** domain (standard recipe),
using the Viz SDK v1 semantics (Space / Render / Variant / `meta.visibility`).

Contract reference: `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

## Goals

- Make climate outputs (rainfall/humidity/temperature) and circulation fields (wind/currents) legible as:
  - a primary continuous scalar/vector field view, plus
  - a small number of alternate expressions that reveal different intuition (e.g. arrows/centroids).
- Keep seasonal and diagnostic depth behind debug by default.
- Avoid temporal `dataTypeKey` explosions: seasons/eras/snapshots live in `variantKey`.

## Step specs (defaults + debug)

Groups correspond to `layer.meta.group`.

### Hydrology / Climate (Baseline + Refine)

**Default**
- `hydrology.climate.rainfall` — `tile.hexOddR::grid` + `points:centroids` (scalar render variants).
- `hydrology.climate.indices.surfaceTemperatureC` — `tile.hexOddR::grid` + `points:centroids` (scalar render variants).

**Debug**
- Secondary climate baseline fields (e.g. baseline humidity), and deep diagnostics from refine steps.

### Hydrology / Climate Indices

**Default**
- Keep only “headline” indices default (temperature already).

**Debug**
- `hydrology.climate.indices.pet`, `hydrology.climate.indices.aridityIndex`, `hydrology.climate.indices.freezeIndex`, etc.

### Hydrology / Seasonality

**Default**
- `hydrology.climate.seasonality.rainfallAmplitude` — `tile.hexOddR::grid`
- `hydrology.climate.seasonality.humidityAmplitude` — `tile.hexOddR::grid`

**Debug**
- Per-season slices of climate fields, using `variantKey`:
  - `hydrology.climate.rainfall` / `hydrology.climate.humidity` with `variantKey: season:<n>`

### Hydrology / Wind (vector field)

**Default**
- `hydrology.wind.wind` — multi-render (gridFields vector + arrows).

**Debug**
- `hydrology.wind.wind` magnitude + centroids.
- component grids `hydrology.wind.windU` / `hydrology.wind.windV`.

### Hydrology / Currents (vector field)

**Default**
- `hydrology.current.current` — multi-render (gridFields vector + arrows).

**Debug**
- `hydrology.current.current` magnitude + centroids.
- component grids `hydrology.current.currentU` / `hydrology.current.currentV`.

### Hydrology / Hydrography

**Default**
- `hydrology.hydrography.discharge` — `tile.hexOddR::grid`
- `hydrology.hydrography.riverClass` (map-stage projection should remain minimal and gameplay-oriented)

**Debug**
- Internal runoff/sink/outlet masks and intermediate routing artifacts.

### Hydrology / Cryosphere

**Default**
- `hydrology.cryosphere.snowCover` — `tile.hexOddR::grid`
- `hydrology.cryosphere.seaIceCover` — `tile.hexOddR::grid`

**Debug**
- `hydrology.cryosphere.albedo`, `groundIce01`, `permafrost01`, `meltPotential01`

### Hydrology / Diagnostics

**Default**
- none (diagnostics are intentionally deep)

**Debug**
- rain shadow / convergence / continentality indices and other “why” layers.

### Map / Hydrology (Engine)

**Default**
- Minimal gameplay-facing projections (e.g. `map.hydrology.rivers.riverClass`).

**Debug**
- engine-vs-physics comparison fields, intermediate projection artifacts, and backfeeds.

## Important products (multi-render expectations)

### Rainfall (scalar field)
- `dataTypeKey`: `hydrology.climate.rainfall`
- Primary expressions (default, debug OFF):
  - `tile.hexOddR::grid` (scalar)
  - `tile.hexOddR::points:centroids` (role: centroids)

### Wind + currents (vector fields)
- `dataTypeKey`: `hydrology.wind.wind` and `hydrology.current.current`
- Primary expressions (default, debug OFF):
  - `tile.hexOddR::gridFields:vector` (role: vector)
  - `tile.hexOddR::segments:arrows` (role: arrows)
- Secondary/debug expressions:
  - `tile.hexOddR::grid:magnitude` (role: magnitude)
  - `tile.hexOddR::points:centroids` (role: centroids)

## Implementation status

This spec is intended to match emissions under:
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/**`
