import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeCrustEvolution from "./ops/compute-crust-evolution/index.js";

/**
 * Canonically binds the Orogeny contract to crust evolution across admitted tectonic history,
 * producing the mature crust later sampled into tile space. The Foundation router is the sole
 * executable aggregate; step authoring continues to reference the contract.
 */
const orogeny = createDomainSubdomainRouter(contract, {
  computeCrustEvolution,
});

export default orogeny;
