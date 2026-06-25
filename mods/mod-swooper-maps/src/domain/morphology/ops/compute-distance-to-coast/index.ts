import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDistanceToCoastContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeDistanceToCoast = createOp(ComputeDistanceToCoastContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default computeDistanceToCoast;
