import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeGeomorphicCycleContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Computes erosion, diffusion, and deposition deltas across the configured geomorphic eras. */
const computeGeomorphicCycle = createOp(ComputeGeomorphicCycleContract, { strategies });

export default computeGeomorphicCycle;
