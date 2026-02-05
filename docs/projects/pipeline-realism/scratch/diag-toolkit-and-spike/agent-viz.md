# Scratch — Viz / observability alignment

## Must-emit layers (baseline correctness harness)

At minimum for tuning and correctness gating:
- `foundation.crustTiles.type|age|baseElevation|strength`
- `foundation.history.*` (per-era + rollups)
- `foundation.provenance.*`
- `morphology.topography.elevation|landMask`

## Must-emit trace summaries

- `morphology.landmassPlates.summary`
- `morphology.geomorphology.summary`

## Gating metrics (from dumps)

- Connected components (landmask) + largest component fraction
- A/B hamming on landmask and elevation for meaningful upstream deltas

