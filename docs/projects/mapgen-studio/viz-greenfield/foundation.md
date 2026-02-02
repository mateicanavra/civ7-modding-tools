# Foundation — Viz v1 Greenfield Spec (Standard Recipe)

This document specifies the **intended** visualization surface for the **Foundation** domain (standard recipe),
using the Viz SDK v1 semantics:

- **Data type**: `dataTypeKey` (semantic identity; no era/snapshot encoded here)
- **Space**: `spaceId` (UI: Space)
- **Render**: `kind[:role]` (UI: Render)
- **Variant**: `variantKey` (semantic slice axis only)
- **Default vs depth**: `meta.visibility` (`default` vs `debug`)

Contract reference: `docs/projects/mapgen-studio/VIZ-SDK-V1.md`

## Goals

- A **maximally minimal** default view (3–7 defaults per step/group where feasible).
- Keep depth accessible via debug toggle, not via “more layers by default”.
- Express the domain’s “important products” with **multiple meaningful renders** when it helps understanding.
- Make temporal depth coherent via `variantKey` (no `dataTypeKey` explosions).

## Binding policy (Foundation-specific)

- “Plates” and “Tectonics” are the core story; defaults should let an author answer:
  - Where are plate boundaries and what regime are they?
  - What are plates doing (movement vectors)?
  - Where is uplift/volcanism expected (the macro consequence)?
- If a layer is primarily for algorithm debugging (intermediate masks, closeness, stress scalars), it should be `debug`.

## Step specs (defaults + debug)

The groups below correspond to `layer.meta.group` as emitted by the pipeline.

### Foundation / Mesh

**Default**
- `foundation.mesh.sites` — `world.xy::points` — mesh sites / cell area intuition.

**Debug**
- `foundation.mesh.edges` — `world.xy::segments:edgeOverlay` — mesh edges overlay.

### Foundation / Crust

**Default**
- `foundation.crust.cellType` — `world.xy::points` — crust categorical type.
- `foundation.crust.cellAge` — `world.xy::points` — age gradient intuition.
- `foundation.crust.cellBaseElevation` — `world.xy::points` — baseline elevation contribution.

**Debug**
- (none by default; add only when a new diagnostic is proven valuable)

### Foundation / Plate Graph

**Default**
- `foundation.plateGraph.plateSeeds` — `world.xy::points` — plate seeds.
- `foundation.plateGraph.cellToPlate` — `world.xy::points` — cell→plate mapping (scatter view).

**Debug**
- (none)

### Foundation / Plate Topology

**Default**
- `foundation.plateTopology.centroidPlateId` — `world.xy::points` — plate identity at centroid.
- `foundation.plateTopology.centroidArea` — `world.xy::points` — plate size intuition.
- `foundation.plateTopology.neighbors` — `world.xy::segments` — adjacency graph.

**Debug**
- (none)

### Foundation / Tile Mapping

**Default**
- (none; this is internal mapping)

**Debug**
- `foundation.tileToCellIndex` — `tile.hexOddR::grid` — tile→mesh-cell mapping index.

### Foundation / Plates (tile-projected)

**Default**
- `foundation.plates.tilePlateId` — `tile.hexOddR::grid` — plate regions (primary).
- `foundation.plates.tileBoundaryType` — `tile.hexOddR::grid` — boundary regime categorical (primary).
- `foundation.plates.tileMovement` — multiple renders (see “important products” below).

**Debug**
- `foundation.plates.tileBoundaryCloseness` — boundary proximity diagnostic.
- `foundation.plates.tileTectonicStress`, `foundation.plates.tileUpliftPotential`, `foundation.plates.tileRiftPotential`,
  `foundation.plates.tileShieldStability`, `foundation.plates.tileVolcanism` — derived field diagnostics.
- `foundation.plates.tileMovementU`, `foundation.plates.tileMovementV`, `foundation.plates.tileRotation` — raw components.

### Foundation / Crust Tiles (tile-projected)

**Default**
- `foundation.crustTiles.type` — `tile.hexOddR::grid` — oceanic vs continental (essential macro story).

**Debug**
- `foundation.crustTiles.age`, `foundation.crustTiles.buoyancy`, `foundation.crustTiles.baseElevation`, `foundation.crustTiles.strength`

### Foundation / Tectonics

**Default**
- `foundation.tectonics.boundaryType` — `world.xy::segments:edges` — boundary edges with regime categories (`variantKey: snapshot:latest`).
- `foundation.tectonics.upliftPotential` — `world.xy::points` — uplift potential (`variantKey: snapshot:latest`).
- `foundation.tectonics.volcanism` — `world.xy::points` — volcanism (`variantKey: snapshot:latest`).
- `foundation.tectonicHistory.lastActiveEra` — `world.xy::points` — “when did tectonics last change here”.

**Debug**
- Snapshot diagnostics: `foundation.tectonics.fracture`, `foundation.tectonics.riftPotential`, `foundation.tectonics.shearStress`.
- Segment components (mechanics overlays): `foundation.tectonics.segmentCompression`, `segmentExtension`, `segmentShear`, `segmentVolcanism`.
- Historical depth: per-era `foundation.tectonics.boundaryType` and `foundation.tectonics.upliftPotential` where `variantKey: era:<n>`.

### Foundation / Tectonic History (aggregates)

**Default**
- (none; keep aggregates off-by-default to avoid confusing “totals” with current state)

**Debug**
- `foundation.tectonicHistory.upliftTotal`, `upliftRecentFraction`, `fractureTotal`, `volcanismTotal`.

## Important products (multi-render expectations)

These products should support **multiple Render modes** in Studio (with debug OFF), so the Render selector is meaningful.

### Plate movement (vector field)
- `dataTypeKey`: `foundation.plates.tileMovement`
- Primary expression (default):
  - `tile.hexOddR::gridFields:vector` (`role: vector`)
  - `tile.hexOddR::segments:arrows` (`role: arrows`)
- Secondary/debug expressions:
  - `tile.hexOddR::grid:magnitude` (`role: magnitude`)
  - `tile.hexOddR::points:centroids` (`role: centroids`)

### Tectonic boundary regime (edges)
- `dataTypeKey`: `foundation.tectonics.boundaryType`
- Primary expression (default):
  - `world.xy::segments:edges` (`role: edges`, `variantKey: snapshot:latest`)
- Secondary/debug expressions:
  - `world.xy::points` (legacy-style points view, `variantKey: snapshot:latest`)
  - `world.xy::points` per-era (`variantKey: era:<n>`)

## Implementation status

This spec is intended to match the standard recipe emissions under:
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/**`

