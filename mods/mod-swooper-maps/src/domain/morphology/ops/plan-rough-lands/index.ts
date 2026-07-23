import { createOp } from "@swooper/mapgen-core/authoring";

import PlanRoughLandsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Plans non-foothill rough uplands from inherited relief, substrate, and drainage signals. */
const planRoughLands = createOp(PlanRoughLandsContract, { strategies });

export default planRoughLands;
