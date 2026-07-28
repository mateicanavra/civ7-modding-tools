import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planStarts from "./ops/plan-starts/index.js";

/**
 * Canonically binds the Starts contract to viable, fair, player-aware assignment using admitted
 * wonder and region evidence. The Placement router is the sole executable aggregate; step
 * authoring continues to reference the contract.
 */
const starts = createDomainSubdomainRouter(contract, {
  planStarts,
});

export default starts;
