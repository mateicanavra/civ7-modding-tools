import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import resolveResourceDemands from "./ops/resolve-resource-demands/index.js";

/**
 * Binds the Demand contract to the one corpus-wide terminal resolution that feeds site selection.
 * The Resources router remains the sole executable aggregate; steps reference the contract.
 */
const demand = createDomainSubdomainRouter(contract, {
  resolveResourceDemands,
});

export default demand;
