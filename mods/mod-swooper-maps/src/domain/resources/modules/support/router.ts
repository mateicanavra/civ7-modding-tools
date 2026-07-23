import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable post-start resource-support branch. */
const support = createDomainSubdomainRouter(contract, implementations);

export default support;
