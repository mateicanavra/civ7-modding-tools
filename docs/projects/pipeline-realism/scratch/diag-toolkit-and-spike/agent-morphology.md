# Scratch — Morphology audit

## Observed failure mode (canonical probe)

At `morphology-coasts.landmass-plates`:
- land components extremely high (speckle)
- largestLandFrac low (no coherent continents)

This exists *before* geomorphology; geomorphology can further shred land by re-thresholding.

## Where speckle comes from (mechanical)

- Base topography includes high-frequency variance:
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/strategies/default.ts`
- Landmask is a threshold:
  - `mods/mod-swooper-maps/src/domain/morphology/ops/compute-landmask/strategies/default.ts`
- Geomorphology can reclassify land/water:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion/steps/geomorphology.ts`

## Consumption surface (what Morphology expects from Foundation)

`morphology-coasts.landmass-plates` requires:
- `foundationArtifacts.crustTiles`
- `foundationArtifacts.tectonicHistoryTiles`
- `foundationArtifacts.tectonicProvenanceTiles`
- `morphologyArtifacts.beltDrivers`

Even with this wiring, coherence requires a **non-degenerate** crust signal and a landmask algorithm that is not dominated by local thresholding of noise.

