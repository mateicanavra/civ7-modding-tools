import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeOceanSurfaceCurrentsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Builds deterministic surface-current vectors from wind, latitude, basin, and coast geometry. */
export default createOp(ComputeOceanSurfaceCurrentsContract, { strategies });
