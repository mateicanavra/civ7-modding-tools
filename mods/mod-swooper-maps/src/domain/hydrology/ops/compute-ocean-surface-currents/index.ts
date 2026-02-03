import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanSurfaceCurrentsContract from "./contract.js";
import { defaultStrategy, earthlikeStrategy } from "./strategies/index.js";

const computeOceanSurfaceCurrents = createOp(ComputeOceanSurfaceCurrentsContract, {
  strategies: { default: defaultStrategy, earthlike: earthlikeStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default computeOceanSurfaceCurrents;
