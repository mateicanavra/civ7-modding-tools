import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

/**
 * Assembles the Placement domain contract with the wonder and start-planning
 * implementation registry used by the terminal recipe stages.
 */
export default createDomain(domain, implementations);
