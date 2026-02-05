# Artifact Catalog (Pipeline-Realism)

This document is the **single source of truth** for the maximal Pipeline-Realism artifact set: what exists, what it means, what space it lives in, and who consumes it.

It is intentionally strict:

- every artifact is classified as `truth`, `projection`, `diagnostics`, or `buffer`
- consumers must not treat diagnostics as truth
- projections must declare their source (`derivedFrom`)

## Classification

- **truth**: canonical substrate for downstream computation; validated; deterministic
- **projection**: derived/resampled view of truth into another coordinate space (usually mesh → tile)
- **diagnostics**: debugging/tuning aids; must not become implicit dependencies
- **buffer**: publish-once but mutated (exception; should remain narrow)

## Catalog

Legend:

- `space`: `mesh` or `tile`
- `range`: see `docs/projects/pipeline-realism/resources/spec/units-and-scaling.md`

| artifactId | kind | space | payload (shape) | key fields / meaning | derivedFrom | consumers | viz `dataTypeKey` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `artifact:foundation.mesh` | truth | mesh | `{ cellCount, siteX[], siteY[], neighborsCSR... }` | mesh geometry + adjacency | — | Foundation | `foundation.mesh.sites`, `foundation.mesh.neighbors` |
| `artifact:foundation.mantlePotential` | truth | mesh | `{ version, cellCount, potential[cell], sourceType[], sourceCell[], sourceAmplitude[], sourceRadius[] }` | mantle potential field; signed | — | Foundation | `foundation.mantle.potential` |
| `artifact:foundation.mantleForcing` | truth | mesh | `{ version, cellCount, forcingU/V[cell], stress[cell], forcingMag[cell], upwellingClass[cell], divergence[cell] }` | derived mantle stress + forcing vector field | `mantlePotential` | Foundation | `foundation.mantle.forcing` |
| `artifact:foundation.crust` | truth | mesh | `{ maturity[cell], thickness[cell], strength[cell], ... }` | canonical lithosphere/crust state | — | Foundation | `foundation.crust.*` |
| `artifact:foundation.plateMotion` | truth | mesh | `{ version, cellCount, plateCount, plateCenterX/Y[plate], plateVelocityX/Y[plate], plateOmega[plate], plateFitRms/P90[plate], plateQuality[plate], cellFitError[cell] }` | plate-like kinematics derived from mantle forcing | `mantleForcing` | Foundation | `foundation.plates.motion` |
| `artifact:foundation.plateGraph` | truth | mesh | `{ cellToPlate[cell], plates[plate]... }` | plate partition + per-plate metadata | `(crust, plateMotion)` | Foundation | `foundation.plates.partition` |
| `artifact:foundation.tectonicSegments` | truth | mesh | `{ segmentCount, aCell[], bCell[], plateA/B[], regime[], ... }` | boundary segments + regimes | `(plateGraph, plateMotion)` | Foundation | `foundation.plates.boundary.*` |
| `artifact:foundation.tectonicHistory` | truth | mesh | `{ eraCount, eras[era]{...}, rollups{...} }` | Eulerian era fields + rollups | `(segments, events)` | Foundation → Morphology | `foundation.history.*` |
| `artifact:foundation.tectonicProvenance` | truth | mesh | `{ version, eraCount, cellCount, tracerIndex[era][cell], provenance{originEra, originPlateId, lastBoundaryEra/Type/Polarity/Intensity, crustAge} }` | Lagrangian provenance: tracer history + scalars | `(history, events)` | Foundation → Morphology | `foundation.provenance.*` |
| `artifact:foundation.tileToCellIndex` | projection | tile | `i32[tile]` | nearest mesh cell per tile | `mesh` | Foundation + downstream | `foundation.projection.tileToCellIndex` |
| `artifact:foundation.tectonicHistoryTiles` | projection | tile | `{ version, eraCount, perEra[tile]{boundaryType, uplift/rift/shear/volcanism/fracture, masks}, rollups{upliftTotal, fractureTotal, volcanismTotal, upliftRecentFraction, lastActiveEra} }` | projected history fields for tile-first consumers | `(tectonicHistory, tileToCellIndex)` | Morphology | `foundation.history.*` |
| `artifact:foundation.tectonicProvenanceTiles` | projection | tile | `{ version, originEra[tile], originPlateId[tile], driftDistance[tile], lastBoundaryEra[tile], lastBoundaryType[tile] }` | projected provenance fields | `(tectonicProvenance, tileToCellIndex)` | Morphology | `foundation.provenance.*` |
| `artifact:foundation.mantleForcingTiles` | projection | tile | `{ forcingU/V[tile], stress01[tile], div/curl... }` | projected mantle forcing (author visual + debug) | `(mantleForcing, tileToCellIndex)` | Studio / debug | `foundation.mantle.forcing` |
| `artifact:foundation.crustTiles` | projection | tile | `{ maturity[tile], thickness[tile], strength[tile], ... }` | projected crust state | `(crust, tileToCellIndex)` | Morphology + debug | `foundation.crust.*` |
| `artifact:morphology.topography` | truth | tile | `{ elevation[i16], seaLevel[f64], landMask[u8] }` | topography output | — | downstream | `morphology.topography.elevation` |

Notes:
- “DerivedFrom” is semantic; implementation may produce projections in a dedicated step.
- Some artifact IDs above may already exist with narrower payloads; the maximal refactor may supersede them (see migration slices).

## Guardrails

- Any artifact marked `diagnostics` must include an “allowed uses / disallowed uses” note at definition time.
- Projections must never feed back into mesh truth computation (no tile→mesh inference).
- If a breaking meaning change occurs without a shape change, treat it as a breaking change (see versioning doc).
