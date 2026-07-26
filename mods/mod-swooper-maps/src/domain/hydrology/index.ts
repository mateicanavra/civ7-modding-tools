import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

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
export { RiverNetworkMeasurementsSchema } from "./ops/compute-river-network-metrics/contract.js";

const domain = defineDomain({ id: "hydrology", ops } as const);

export { artifacts } from "./artifacts/index.js";

export default domain;
