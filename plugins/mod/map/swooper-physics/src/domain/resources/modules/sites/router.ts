import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import selectResourceSites from "./ops/select-resource-sites/index.js";

/**
 * Canonically binds the Sites contract to deterministic placement selection under admitted demand
 * and eligibility evidence. The Resources router is the sole executable aggregate; step authoring
 * continues to reference the contract.
 */
const sites = createDomainSubdomainRouter(contract, {
  selectResourceSites,
});

export default sites;
