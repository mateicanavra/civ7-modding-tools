export {
  ERA_COUNT_MAX,
  ERA_COUNT_MIN,
  EVENT_TYPE,
  OROGENY_ERA_GAIN_MAX,
  OROGENY_ERA_GAIN_MIN,
} from "./constants.js";
export { buildBoundaryEventsFromSegments, buildHotspotEvents } from "./events.js";
export { buildEraFields, deriveEmissionParams } from "./fields.js";
export type {
  FoundationTectonicEraFieldsInternal,
  TectonicEventRecord,
} from "./internal-contract.js";
export {
  FoundationTectonicEraFieldsInternalListSchema,
  FoundationTectonicEraFieldsInternalSchema,
  PlateIdByEraSchema,
  TectonicEventSchema,
  TectonicEventsSchema,
  TracerIndexByEraSchema,
} from "./internal-contract.js";
export { computePlateIdByEra } from "./membership.js";
export { computeTectonicProvenance } from "./provenance.js";
export { buildTectonicHistoryRollups, buildTectonicsCurrent, computeEraGain } from "./rollups.js";
export { computeTracerIndexByEra } from "./tracing.js";
