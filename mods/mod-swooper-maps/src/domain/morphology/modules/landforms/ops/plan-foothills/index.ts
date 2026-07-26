import { createOp } from "@swooper/mapgen-core/authoring";

import PlanFoothillsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Plans foothill terrain around mountain regions without overlapping their peak masks. */
const planFoothills = createOp(PlanFoothillsContract, { strategies });

export default planFoothills;
