import { createOp } from "@swooper/mapgen-core/authoring";

import PlanStartsContract from "./contract.js";
import strategies from "./strategies/index.js";

/**
 * Selects first-age seat intent through the closed fallback ladder and records every relaxation.
 * Recipe materialization consumes the result without choosing starts locally.
 */
const planStarts = createOp(PlanStartsContract, { strategies });

export default planStarts;
