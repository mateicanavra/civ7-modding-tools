export {
  EVENT_TYPE,
  OROGENY_ERA_GAIN_MIN,
  OROGENY_ERA_GAIN_MAX,
  ERA_COUNT_MIN,
  ERA_COUNT_MAX,
} from "./constants.js";

export {
  TectonicEventSchema,
  TectonicEventsSchema,
  FoundationTectonicEraFieldsInternalSchema,
  FoundationTectonicEraFieldsInternalListSchema,
  PlateIdByEraSchema,
  TracerIndexByEraSchema,
} from "./internal-contract.js";

export { computePlateIdByEra } from "./membership.js";
export { buildBoundaryEventsFromSegments, buildHotspotEvents } from "./events.js";
export { deriveEmissionParams, buildEraFields } from "./fields.js";
export { computeEraGain, buildTectonicHistoryRollups, buildTectonicsCurrent } from "./rollups.js";
export { computeTracerIndexByEra } from "./tracing.js";
export { computeTectonicProvenance } from "./provenance.js";

export type { TectonicEventRecord, FoundationTectonicEraFieldsInternal } from "./internal-contract.js";
