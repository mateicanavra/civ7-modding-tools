import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeShelfMaskContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeShelfMask = createOp(ComputeShelfMaskContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default computeShelfMask;

