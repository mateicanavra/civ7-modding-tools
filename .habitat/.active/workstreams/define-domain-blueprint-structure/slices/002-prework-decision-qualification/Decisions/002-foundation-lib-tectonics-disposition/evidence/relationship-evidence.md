# Relationship Evidence

Status: closed evidence artifact

## Commands

Representative commands:

```bash
find mods/mod-swooper-maps/src/domain/foundation/lib -type f | sort
rg -n "lib/tectonics/(constants|internal-contract|schemas|shared)\\.js" mods/mod-swooper-maps/src mods/mod-swooper-maps/test packages apps tools docs
rg -n "lib/tectonics/(index|events|fields|membership|provenance|rollups|tracing)\\.ts|lib/tectonics/(index|events|fields|membership|provenance|rollups|tracing)\\.js|lib/tectonics/(events|fields|membership|provenance|rollups|tracing)" mods/mod-swooper-maps/src mods/mod-swooper-maps/test docs .habitat packages apps tools
rg -n "computeEraGain|OROGENY_ERA_GAIN|buildTectonicHistoryRollups|buildTectonicsCurrent" mods/mod-swooper-maps/src/domain/foundation mods/mod-swooper-maps/src/recipes docs/system docs/projects
find packages/mapgen-core/src -maxdepth 4 -type f | sort
```

This is source/import evidence. It is not a compiler graph, runtime trace, or
generated-output proof.

## Live Import Clusters

| Cluster | Evidence | Interpretation |
| --- | --- | --- |
| Crust buoyancy policy | `compute-crust/index.ts` and `compute-crust-evolution/index.ts` import `lib/crust/buoyancy.js`. | Cross-operation foundation crust semantic policy, not deletion. |
| Reference-area policy | `compute-mesh/index.ts`, `compute-plate-graph/index.ts`, and `test/foundation/reference-area-policy.test.ts` import `lib/normalize.js`. | Named foundation reference-area/dimension policy, not operation-private logic. |
| Artifact input guards | fourteen foundation operations/rules import `lib/require.js`. | Live cross-operation guard support. It is not a truth contract owner because it consumes operation contract types and validates runtime payloads. |
| Tectonics policy constants | hotspot, segment-events, era-fields, tracer-advection, and provenance rules import `lib/tectonics/constants.js`. | Shared foundation tectonics semantic policy. |
| Tectonics internal contracts | event, era, membership, tracer, history, current, and provenance contracts/rules import `lib/tectonics/internal-contract.js`. | Artifact-contract surface, likely split by artifact in execution. |
| Tectonics public schemas | crust-evolution, plates-tensors, history/current/provenance contracts and rules import `lib/tectonics/schemas.js`. | Artifact-contract surface, not operation-local deletion. |
| Tectonics helper support | hotspot, provenance, era-fields, history, segments, plates-tensors, and tracer rules import `lib/tectonics/shared.js`. | Live helper surface. Current evidence is stronger for foundation operation-rule support than for core extraction. |

## Duplicate Operation-Local Implementations

Unused `lib/tectonics/*` implementation files have active operation-local
counterparts:

| Unused lib symbol | Active owner evidence |
| --- | --- |
| `buildBoundaryEventsFromSegments` | `ops/compute-segment-events/rules/index.ts`; strategy imports from operation rules. |
| `buildHotspotEvents` | `ops/compute-hotspot-events/rules/index.ts`; strategy imports from operation rules. |
| `deriveEmissionParams`, `buildEraFields` | `ops/compute-era-tectonic-fields/rules/index.ts`; strategy imports from operation rules. |
| `computePlateIdByEra` | `ops/compute-era-plate-membership/rules/compute-plate-id-by-era.ts`; rules barrel re-exports it. |
| `computeTectonicProvenance` | `ops/compute-tectonic-provenance/rules/index.ts`; strategy imports from operation rules. |
| `buildTectonicHistoryRollups` | `ops/compute-tectonic-history-rollups/rules/index.ts`; strategy imports from operation rules. |
| `buildTectonicsCurrent` | `ops/compute-tectonics-current/rules/index.ts`; strategy imports from operation rules. |
| `computeTracerIndexByEra` | `ops/compute-tracer-advection/rules/index.ts`; strategy imports from operation rules. |

`lib/tectonics/rollups.ts` also exports `computeEraGain`, but source search
found no importer for that symbol. The standard recipe currently contains its
own orogeny-era gain constants and calculation, so the lib export is not a live
shared owner.

## Core Ownership Check

`packages/mapgen-core/src/lib/**` already owns reusable math, grid, mesh, noise,
plates, RNG, and collection mechanics. Foundation code imports those surfaces.
No evidence was found that `packages/mapgen-core/src/**` imports foundation
`lib/**`, and the live foundation helper rows carry foundation semantic names,
artifact payload knowledge, operation contract knowledge, or tectonics
meaning.

Conclusion: this packet does not classify any current `foundation/lib/**` row
as ready for `packages/mapgen-core` extraction. A later slice may split pure
helpers only after proving the resulting symbol is domain-free and naming an
exact core owner file.
