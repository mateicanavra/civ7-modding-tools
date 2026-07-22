import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeGeomorphicCycleContract from "./contract.js";
import { streamPowerDiffusionStrategy } from "./strategies/index.js";

const computeGeomorphicCycle = createOp(ComputeGeomorphicCycleContract, {
  strategies: {
    "stream-power-diffusion": streamPowerDiffusionStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeGeomorphicCycle;
