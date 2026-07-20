import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

/**
 * Assembles the Hydrology domain contract with the climate, drainage, lake,
 * and river implementation registry consumed by truth and projection steps.
 */
export default createDomain(domain, implementations);
