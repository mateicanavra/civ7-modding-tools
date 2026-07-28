import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import demand from "./modules/demand/router.js";
import habitat from "./modules/habitat/router.js";
import sites from "./modules/sites/router.js";
import support from "./modules/support/router.js";

/**
 * Binds Resources' habitat, demand, site, and support contracts to the executable chain that turns
 * map evidence into authoritative resource intent and post-start adjustment. Recipe runtime
 * compilation consumes this router; step authoring imports the contract-only domain.
 */
const resources = createDomainRouter(contract, {
  demand,
  habitat,
  sites,
  support,
});

export default resources;
