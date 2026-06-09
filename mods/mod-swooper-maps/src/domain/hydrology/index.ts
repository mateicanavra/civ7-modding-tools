import { defineDomain } from "@swooper/mapgen-core/authoring";

import ops from "./ops/contracts.js";
export { HydrologyWindFieldSchema } from "./ops/shared/wind-field.js";
export {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
  findInvalidRiverClassIndex,
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
  isValidRiverClass,
} from "./river-class.js";

const domain = defineDomain({ id: "hydrology", ops } as const);

export default domain;
