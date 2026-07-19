import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanSurfaceCurrentsContract from "./contract.js";
import { latitudeStrategy, windGyreProjectionStrategy } from "./strategies/index.js";

/** Computes ocean currents through the contract-selected coupled or latitude-only model. */
const computeOceanSurfaceCurrents = createOp(ComputeOceanSurfaceCurrentsContract, {
  strategies: { "wind-gyre-projection": windGyreProjectionStrategy, latitude: latitudeStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeOceanSurfaceCurrents;
