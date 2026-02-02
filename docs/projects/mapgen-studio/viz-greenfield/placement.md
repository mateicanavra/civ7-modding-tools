# Placement — Viz v1 Greenfield Spec (Standard Recipe)

This document specifies the **intended** visualization surface for the **Placement** domain (standard recipe),
using the Viz SDK v1 semantics (Space / Render / Variant / `meta.visibility`).

Contract reference: `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

## Goals

- Keep placement visualizations **maximally minimal** and gameplay-oriented.
- Prefer “meaning” layers over internal diagnostics:
  - west/east landmass region assignment
  - start sector grid (planning aid)
  - chosen start positions
- When a product is important (start positions), provide **multiple Render modes**
  with debug OFF (grid membership + point markers).

## Step specs (defaults + debug)

Groups correspond to `layer.meta.group`.

### Gameplay / Placement

**Default**
- `placement.landmassRegions.regionSlot` — `tile.hexOddR::grid` — west/east assignment used to split starts.
- `placement.starts.startPosition` — multi-render (grid membership + point markers).

**Debug**
- `placement.starts.sectorId` — `tile.hexOddR::grid` — diagnostic view of start-sector activation.

## Important products (multi-render expectations)

### Start positions (chosen)
- `dataTypeKey`: `placement.starts.startPosition`
- Primary expressions (default, debug OFF):
  - `tile.hexOddR::grid:membership` — player membership per tile (0 = none).
  - `tile.hexOddR::points` — point markers at chosen plots (colored per player).

## Implementation status

This spec is intended to match emissions under:
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/**`

