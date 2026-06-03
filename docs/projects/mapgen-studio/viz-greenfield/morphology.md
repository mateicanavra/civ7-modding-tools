# Morphology — Viz v1 Greenfield Spec (Standard Recipe)

This document specifies the **intended** visualization surface for the **Morphology** domain (standard recipe),
using the Viz SDK v1 semantics (Space / Render / Variant / `meta.visibility`).

Contract reference: `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

## Goals

- Make the *shape of the world* legible early (land mask + elevation), then progressively explain:
  - coastlines + islands,
  - mountains + volcanoes,
  - routing/flow fields (as real continuous fields, not just scalar grids),
  - post-processing effects (geomorphology, deltas, etc).
- Keep defaults **maximally minimal**; emit deep diagnostics as `debug`.
- Ensure “important products” expose **multiple Render modes** with debug OFF where it materially helps comprehension.

## Step specs (defaults + debug)

The groups below correspond to `layer.meta.group` as emitted by the pipeline.

### Morphology / Landmasses

**Default**
- `morphology.landmass.landMask` — `tile.hexOddQ::grid` — land vs water.

**Debug**
- none

### Morphology / Islands

**Default**
- `morphology.islands.islandMask` — `tile.hexOddQ::grid` — island classification mask.

**Debug**
- none

### Morphology / Coastlines

**Default**
- `morphology.coast.coastMask` — `tile.hexOddQ::grid`
- `morphology.coast.shallowMask` — `tile.hexOddQ::grid`
- `morphology.coast.deepMask` — `tile.hexOddQ::grid`

**Debug**
- none

### Morphology / Topography

**Default**
- `morphology.topography.elevation` — `tile.hexOddQ::grid` — primary continuous truth.
- `morphology.topography.landMask` — `tile.hexOddQ::grid` — paired with elevation for interpretation.

**Debug**
- `morphology.topography.bathymetry` — `tile.hexOddQ::grid` — useful, but not always needed.

### Morphology / Substrate

**Default**
- `morphology.substrate.sedimentDepth` — `tile.hexOddQ::grid` — “how much movable material exists here”.

**Debug**
- `morphology.substrate.erodibilityK` — `tile.hexOddQ::grid` — more model-specific.

### Morphology / Volcanoes

**Default**
- `morphology.volcanoes.volcanoMask` — `tile.hexOddQ::points` (or grid, depending on producer) — volcano presence.
- `morphology.volcanoes.volcanoDensity` — continuous intensity.

**Debug**
- none

### Morphology / Routing

**Default**
- `morphology.routing.flowAccum` — `tile.hexOddQ::grid` — water routing “strength”.
- `morphology.routing.flow` — multiple renders (see “important products” below).
- `morphology.routing.riverMask` — `tile.hexOddQ::grid` — discrete river-eligible mask.

**Debug**
- Any intermediate routing debug masks or step internals.

### Morphology / Geomorphology

**Default**
- `morphology.geomorphology.elevation` — `tile.hexOddQ::grid` — post-processed elevation truth.
- `morphology.geomorphology.landMask` — `tile.hexOddQ::grid`
- `morphology.geomorphology.slope` — `tile.hexOddQ::grid` — downstream relevance.

**Debug**
- `morphology.geomorphology.deltaMask`, `morphology.geomorphology.bathymetry` and other comparison grids.

### Map / Morphology (Engine) (map-stage consumer views)

These are “map-stage” emissions that project morphology outputs into engine-facing constraints.

**Default**
- `map.morphology.mountains.mountainMask` — `tile.hexOddQ::grid` — primary gameplay-facing shape.

**Debug**
- engine-vs-physics comparison grids or intermediate projection artifacts.

## Important products (multi-render expectations)

### Routing flow (vector field)
- `dataTypeKey`: `morphology.routing.flow`
- Primary expressions (default, debug OFF):
  - `tile.hexOddQ::gridFields:vector` (`role: vector`)
  - `tile.hexOddQ::segments:arrows` (`role: arrows`)
- Secondary/debug expressions:
  - `tile.hexOddQ::grid:magnitude` (`role: magnitude`)
  - `tile.hexOddQ::points:centroids` (`role: centroids`)

## Implementation status

This spec is intended to match the standard recipe emissions under:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/**`
