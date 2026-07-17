import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

/**
 * Assembles the Resources domain contract with habitat, demand, site-selection,
 * and support-adjustment implementations for placement planning.
 */
export default createDomain(domain, implementations);
