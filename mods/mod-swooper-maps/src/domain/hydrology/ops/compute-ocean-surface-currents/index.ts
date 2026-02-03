import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanSurfaceCurrentsContract from "./contract.js";
import { defaultStrategy, latitudeStrategy } from "./strategies/index.js";

const computeOceanSurfaceCurrents = createOp(ComputeOceanSurfaceCurrentsContract, {
  strategies: { default: defaultStrategy, latitude: latitudeStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default computeOceanSurfaceCurrents;
