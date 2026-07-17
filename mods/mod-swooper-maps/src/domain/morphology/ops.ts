import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

/**
 * Assembles the Morphology domain contract with its topography, routing,
 * erosion, coast, and landform implementation registry.
 */
export default createDomain(domain, implementations);
