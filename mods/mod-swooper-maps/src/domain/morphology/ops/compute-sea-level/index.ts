import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSeaLevelContract from "./contract.js";
import { hypsometricTargetStrategy } from "./strategies/index.js";

const computeSeaLevel = createOp(ComputeSeaLevelContract, {
  strategies: {
    "hypsometric-target": hypsometricTargetStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeSeaLevel;
