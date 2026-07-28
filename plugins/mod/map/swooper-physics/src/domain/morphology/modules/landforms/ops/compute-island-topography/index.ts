import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeIslandTopographyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Computes deterministic island-chain and microcontinent land over post-erosion topography. */
const computeIslandTopography = createOp(ComputeIslandTopographyContract, { strategies });

export default computeIslandTopography;
