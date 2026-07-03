# Source Inventory

Status: closed evidence artifact

Source set:

```text
mods/mod-swooper-maps/src/domain/foundation/lib/crust/buoyancy.ts
mods/mod-swooper-maps/src/domain/foundation/lib/normalize.ts
mods/mod-swooper-maps/src/domain/foundation/lib/require.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/constants.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/events.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/fields.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/index.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/internal-contract.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/membership.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/provenance.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/rollups.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/schemas.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts
mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/tracing.ts
```

## Inventory Rows

| File | Exports | Direct source importers | Initial role tag | Evidence limits |
| --- | --- | --- | --- | --- |
| `lib/crust/buoyancy.ts` | crust buoyancy constants, strength thresholds, `deriveBuoyancy`, `isContinentalMaturity`, `strengthFrom*` | `compute-crust/index.ts`; `compute-crust-evolution/index.ts` | domain model policy | Current comments call it shared crust buoyancy/strength/classification model; no evidence of core ownership. |
| `lib/normalize.ts` | `requireEnvDimensions`; `deriveFoundationReferenceArea` | `compute-mesh/index.ts`; `compute-plate-graph/index.ts`; `test/foundation/reference-area-policy.test.ts` | domain model policy | Live policy/test evidence; destination needs exact model-policy naming. |
| `lib/require.ts` | `requireMesh`, `requireCrust`, `requireMantlePotential`, `requireMantleForcing`, `requirePlateGraph`, `requirePlateMotion`, `requireTectonics`, `requireTectonicHistory`, `requireTectonicProvenance` | fourteen foundation operation/rules consumers | operation-rule support | Live cross-operation guard support; not an artifact contract because it validates imported artifacts rather than defining their truth contracts. |
| `lib/tectonics/constants.ts` | reset thresholds, `ADVECTION_STEPS_PER_ERA`, `EVENT_TYPE`, orogeny gain constants, era-count bounds | hotspot, segment-events, era-fields, tracer-advection, and provenance rules | domain model policy | Live shared semantic constants; no authored-data collection. |
| `lib/tectonics/internal-contract.ts` | `TectonicEventSchema`, `TectonicEventsSchema`, era-field schemas, plate/tracer array schemas, record/types | event, era, tracer, history, current, and provenance contracts/rules | artifact contract | File mixes several internal product contracts; execution likely splits by artifact. |
| `lib/tectonics/schemas.ts` | `FoundationTectonicHistorySchema`, `FoundationTectonicsSchema`, `FoundationTectonicProvenanceSchema`, corresponding types | crust-evolution contract, plates-tensors contract/lib, history/current/provenance contracts/rules | artifact contract | Live artifact schemas; exact extraction surface needs reference update. |
| `lib/tectonics/shared.ts` | `NeighborhoodMesh`, byte/int8 clamp helpers, vector normalization, mean-edge, nearest-cell, drift neighbor, reset threshold | hotspot, provenance, era-fields, history, segments, plates-tensors, tracer rules | operation-rule support with possible later split | Some helpers are generic-looking, but no current core consumer or pure-core proof. |
| `lib/tectonics/index.ts` | barrel exports for tectonics helpers/contracts | none found | deletion | Delete only in later execution with typecheck. |
| `lib/tectonics/events.ts` | `buildBoundaryEventsFromSegments`; `buildHotspotEvents` | none found | deletion | Active equivalents live under `compute-segment-events/rules` and `compute-hotspot-events/rules`. |
| `lib/tectonics/fields.ts` | `deriveEmissionParams`; `buildEraFields` | none found | deletion | Active equivalent lives under `compute-era-tectonic-fields/rules`; docs call it a stale clone. |
| `lib/tectonics/membership.ts` | `ERA_COUNT_*`; `computePlateIdByEra` | none found | deletion | Active equivalent lives under `compute-era-plate-membership/rules`. |
| `lib/tectonics/provenance.ts` | `computeTectonicProvenance` | none found | deletion | Active equivalent lives under `compute-tectonic-provenance/rules`. |
| `lib/tectonics/rollups.ts` | `computeEraGain`; `buildTectonicHistoryRollups`; `buildTectonicsCurrent` | none found | deletion | Active equivalents are split under `compute-tectonic-history-rollups/rules` and `compute-tectonics-current/rules`; `computeEraGain` is not imported. |
| `lib/tectonics/tracing.ts` | `computeTracerIndexByEra` | none found | deletion | Active equivalent lives under `compute-tracer-advection/rules`. |

## Collar Evidence

`mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`
is not in the inventory source set, but it imports live tectonics schemas and
shared helpers. It remains an operation-local implementation collar for
`compute-plates-tensors`, not a foundation `lib/**` disposition row.
