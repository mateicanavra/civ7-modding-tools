import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

/**
 * Assembles the Foundation domain contract with the mesh, mantle, crust, and
 * tectonics implementation registry used by Foundation recipe steps.
 */
export default createDomain(domain, implementations);
