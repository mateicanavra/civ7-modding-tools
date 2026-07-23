import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

export { RiverNetworkMeasurementsSchema } from "./model/atoms/river-network-measurements.schema.js";
export {
  findInvalidRiverClassIndex,
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
  isValidRiverClass,
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
} from "./model/policy/river-class.js";

const domain = defineDomain({ id: "hydrology", ops } as const);

export { artifacts } from "./artifacts/index.js";

export default domain;
