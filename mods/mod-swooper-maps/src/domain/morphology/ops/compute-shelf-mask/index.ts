import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeShelfMaskContract from "./contract.js";
import { physicalBreakConnectivityStrategy } from "./strategies/index.js";

const computeShelfMask = createOp(ComputeShelfMaskContract, {
  strategies: {
    "physical-break-connectivity": physicalBreakConnectivityStrategy,
  },
});

export type * from "./contract.js";

export default computeShelfMask;
