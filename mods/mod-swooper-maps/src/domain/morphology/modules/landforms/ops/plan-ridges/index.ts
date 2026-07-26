import { createOp } from "@swooper/mapgen-core/authoring";

import PlanRidgesContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Plans tectonically supported mountain spines, regions, and diagnostic driver surfaces. */
const planRidges = createOp(PlanRidgesContract, { strategies });

export default planRidges;
