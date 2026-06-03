# Ecology — Viz v1 Greenfield Spec (Standard Recipe)

This document specifies the **intended** visualization surface for the **Ecology** domain (standard recipe),
using the Viz SDK v1 semantics (Space / Render / Variant / `meta.visibility`).

Contract reference: `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

## Goals

- Make the “ecology truth” legible and minimal:
  - soils (pedology)
  - biomes + vegetation/moisture
  - feature intents (what we *plan* to place)
- Keep “why” and diagnostic fields (freeze/aridity/permafrost scaffolding) behind debug.
- When a scalar field is important (e.g. vegetation density), provide **multiple Render modes** (grid + sampled points)
  with debug OFF so the Render selector is meaningful.

## Step specs (defaults + debug)

Groups correspond to `layer.meta.group`.

### Ecology / Pedology

**Default**
- `ecology.pedology.soilType` — `tile.hexOddQ::grid` — categorical soil type.
- `ecology.pedology.fertility` — `tile.hexOddQ::grid` + `points:centroids` — fertility scalar field.

**Debug**
- (none by default; pedology should stay simple)

### Ecology / Resource Basins

**Default**
- `ecology.resourceBasins.resourceBasinId` — `tile.hexOddQ::grid` — categorical basin membership.

**Debug**
- (none)

### Ecology / Biomes

**Default**
- `ecology.biome.biomeIndex` — `tile.hexOddQ::grid` — biome classification (categorical).
- `ecology.biome.vegetationDensity` — `tile.hexOddQ::grid` + `points:centroids` — primary vegetation signal.
- `ecology.biome.effectiveMoisture` — `tile.hexOddQ::grid` + `points:centroids` — primary moisture signal.

**Debug**
- Secondary biome inputs/diagnostics:
  - `ecology.biome.surfaceTemperature`
  - `ecology.biome.aridityIndex`
  - `ecology.biome.freezeIndex`
  - `ecology.biome.groundIce01`, `permafrost01`, `meltPotential01`, `treeLine01`

### Ecology / Feature Intents

**Default**
- `ecology.featureIntents.featureType` — `tile.hexOddQ::points` — planned placements, categorized by feature key.

**Debug**
- (none; placement is already sparse and “meaningful” by default)

### Map / Ecology (Engine)

These layers reflect engine writeback / projected state (not ecology truth). Keep them minimal and gameplay-facing.

**Default**
- `map.ecology.biomeId` — `tile.hexOddQ::grid` — engine biome id after plotting.
- `map.ecology.temperature` — `tile.hexOddQ::grid` — engine temperature field after plotting.
- `map.ecology.plotEffects.plotEffect` — `tile.hexOddQ::points` — placed plot effects.

**Debug**
- engine-vs-physics comparisons and intermediate masks belong behind debug.

## Important products (multi-render expectations)

### Vegetation density (scalar field)
- `dataTypeKey`: `ecology.biome.vegetationDensity`
- Primary expressions (default, debug OFF):
  - `tile.hexOddQ::grid`
  - `tile.hexOddQ::points:centroids`

### Effective moisture (scalar field)
- `dataTypeKey`: `ecology.biome.effectiveMoisture`
- Primary expressions (default, debug OFF):
  - `tile.hexOddQ::grid`
  - `tile.hexOddQ::points:centroids`

### Fertility (scalar field)
- `dataTypeKey`: `ecology.pedology.fertility`
- Primary expressions (default, debug OFF):
  - `tile.hexOddQ::grid`
  - `tile.hexOddQ::points:centroids`

## Implementation status

This spec is intended to match emissions under:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`

