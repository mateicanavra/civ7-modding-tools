import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable resource-site selection branch. */
const sites = createDomainSubdomainRouter(contract, implementations);

export default sites;
