import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeGeomorphicCycleContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Shapes coherent initial hillslopes and copies the admitted material substrate. */
const computeGeomorphicCycle = createOp(ComputeGeomorphicCycleContract, { strategies });

export default computeGeomorphicCycle;
