import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

/**
 * Assembles the Ecology domain contract with its biome, pedology, feature, and
 * plot-effect implementation registry for recipe consumers.
 */
export default createDomain(domain, implementations);
