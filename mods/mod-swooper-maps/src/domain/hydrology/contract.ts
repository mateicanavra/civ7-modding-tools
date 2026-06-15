import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "hydrology", ops } as const);

export default domain;

export { HydrologyWindFieldSchema } from "./ops/shared/wind-field.js";
export {
  findInvalidRiverClassIndex,
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
  isValidRiverClass,
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
} from "./river-class.js";
export * from "./river-network-metrics.js";
