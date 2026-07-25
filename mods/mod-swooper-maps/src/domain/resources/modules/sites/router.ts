import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import selectResourceSites from "./ops/select-resource-sites/index.js";

/** Executable resource-site selection branch. */
const sites = createDomainSubdomainRouter(contract, {
  selectResourceSites,
});

export default sites;
