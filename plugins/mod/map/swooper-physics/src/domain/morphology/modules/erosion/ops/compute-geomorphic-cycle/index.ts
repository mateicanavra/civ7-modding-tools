import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeGeomorphicCycleContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Evolves coherent relief and substrate through configured erosion, diffusion, and deposition. */
const computeGeomorphicCycle = createOp(ComputeGeomorphicCycleContract, { strategies });

export default computeGeomorphicCycle;
