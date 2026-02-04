# Visualization and Tuning Loop (Pipeline-Realism)

This section defines the **required visualization layer taxonomy** for the maximal Pipeline-Realism Foundation refactor.

Visualization is for **human interpretability and authoring iteration** (Studio tuning loops). It is **not** correctness gating; correctness lives in D09r validation.

## Canonical Viz Architecture (Do Not Fork)

This project must not introduce a second visualization architecture doc. The repo’s canonical deck.gl visualization design and contracts remain:

- Routing + contract: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Canonical architecture: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Trace posture: `docs/system/libs/mapgen/reference/OBSERVABILITY.md`

This section only defines the **Pipeline-Realism-specific layer taxonomy** and stable keys to emit.

## Key Contract (Stable Identity)

Layers are keyed by the canonical identity components described in the viz contract. Treat:

- `dataTypeKey` as the stable, semantic API.
- `spaceId`, `kind`, `role`, `variantKey` as representation/scoping (including eras and raw/smoothed/derived).

Rules:

- `dataTypeKey` MUST be semantic and stable. Do not bake step IDs, “v2”, “smoothed”, or algorithm names into it.
- Prefer disambiguation by `spaceId` (mesh vs tile) and `variantKey` (era/stage) over new keys.

## Coordinate Spaces (Must Be Explicit)

Visualization must not guess coordinate spaces:

- Mesh truth: `spaceId = "mesh.world"`
- Tile projections: `spaceId = "tile.hexOddR"` (Civ-like wide map)

When a signal exists both as mesh truth and as a tile projection, we SHOULD emit both for tuning:

- mesh truth (debug truth)
- tile projection (what downstream tile-first consumers see)

## Layer Taxonomy

### Debug Truth layers (engineer-facing)

Definition: raw or minimally-derived truth artifacts that explain what the engine believes is true.

- default visibility: hidden / debug
- emphasis: mesh-space truth artifacts
- primary use: explain causality, debug invariants, debug projections

### Refined Author Visuals (tuning-facing)

Definition: layers optimized for interpretability and fast iteration:

- default visibility: on (or one-click away)
- emphasis: continuous fields, stable palettes, belt corridors, projections that match Morphology consumption
- primary use: “what changed when I tweaked X?”

## Required `variantKey` Conventions

To keep layering consistent and enable timelines:

- `variantKey = "era:<n>"` for per-era layers.
- `variantKey = "stage:raw" | "stage:smoothed" | "stage:derived"` for truth refinement.
- `variantKey = "algo:<name>"` only when intentionally comparing algorithms inside the same run (avoid by default).

## Required Layer Keys (Maximal Foundation Spine)

The goal is a stable “causality spine” that matches the maximal engine’s story:

config → mantle → plates → events → history/provenance → morphology consumption.

### Mesh + projection anchors

- `foundation.mesh.sites` (mesh points; debug truth)
- `foundation.mesh.neighbors` (mesh adjacency; debug truth)
- `foundation.projection.tileToCellIndex` (tile grid; debug truth)

### Mantle forcing (D02r)

Truth (mesh):
- `foundation.mantle.potential` (signed; `variantKey` stage:raw/stage:smoothed)
- `foundation.mantle.forcing` (vector fields; derived; includes divergence/curl/stress proxies)

Projection (tile):
- `foundation.mantle.potential` (projected)
- `foundation.mantle.forcing` (projected; same semantic key, different `spaceId`)

### Crust state (D05r)

Truth (mesh):
- `foundation.crust.maturity`
- `foundation.crust.thickness`
- `foundation.crust.strength`
- `foundation.crust.buoyancy` (derived convenience ok, but must be traceable to truth)

Projection (tile):
- `foundation.crust.maturity`
- `foundation.crust.thickness`
- `foundation.crust.strength`
- `foundation.crust.buoyancy`

### Plate motion + partition (D03r + D01)

Truth (mesh):
- `foundation.plates.motion` (per-cell velocity/rotation signals)
- `foundation.plates.partition` (cell->plate id; categorical)

Boundary regime layers (mesh):
- `foundation.plates.boundary.regime` (segments; categorical)
- `foundation.plates.boundary.relativeSpeed` (segments)
- `foundation.plates.boundary.convergence` (segments)
- `foundation.plates.boundary.shear` (segments)

### Events + force emission (D06r)

Truth (mesh):
- `foundation.events.boundary` (events on segments/corridors; per-era via `variantKey=era:<n>`)

Refined author visuals (tile corridors; per-era):
- `foundation.belts.orogenyPotential`
- `foundation.belts.volcanismPotential`
- `foundation.belts.riftPotential`

### History (Eulerian; D04r)

Projection (tile; per-era):
- `foundation.history.regime` (`variantKey=era:<n>`)
- `foundation.history.boundaryIntensity` (`variantKey=era:<n>`)

Rollups (tile; aggregate):
- `foundation.history.lastActiveEra` (categorical/quantized)
- `foundation.history.upliftRecentFraction`

### Provenance (Lagrangian → tiles; D04r)

Truth (mesh):
- `foundation.provenance.tracerAge`
- `foundation.provenance.lineage`

Projection (tile):
- `foundation.provenance.tracerAge`
- `foundation.provenance.lineage`

### Morphology consumption drivers (D07r)

These are the “author-facing” confirmation that the refactor is actually feeding downstream correctly:

- `morphology.drivers.uplift` (tile)
- `morphology.drivers.volcanism` (tile)
- `morphology.drivers.fracture` (tile)

Optional (output response visual):
- `morphology.topography.elevation` (tile; meters)

## Emission Timing (Where Layers Should Be Dumped)

This section does not define step IDs (those are subject to stage renames), but it defines ordering:

1. After mesh build: mesh anchors.
2. After mantle forcing computed: mantle truth + projections.
3. After crust state initialized/updated: crust truth + projections.
4. After plate motion + partition: motion + partition + boundary regime.
5. Per era: events + belt potentials + history/provenance per-era layers.
6. At morphology consumption boundary: morphology driver layers.

## Anti-Patterns (Do Not Do These)

- Do not introduce a second deck.gl architecture doc.
- Do not encode volatile detail in `dataTypeKey`.
- Do not only visualize tile-space: mesh truth must remain available for debugging causality.
- Do not use visualization layers as correctness gates; use D09r validation.

