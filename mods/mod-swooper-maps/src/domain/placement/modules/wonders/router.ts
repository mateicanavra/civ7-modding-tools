import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planNaturalWonders from "./ops/plan-natural-wonders/index.js";
import planWonders from "./ops/plan-wonders/index.js";

/**
 * Canonically binds the Wonders contract to map-size demand and natural-wonder site planning before
 * region and start assignment. The Placement router is the sole executable aggregate; step
 * authoring continues to reference the contract.
 */
const wonders = createDomainSubdomainRouter(contract, {
  planWonders,
  planNaturalWonders,
});

export default wonders;
