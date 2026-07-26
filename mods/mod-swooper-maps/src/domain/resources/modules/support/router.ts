import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import adjustResourceSupport from "./ops/adjust-resource-support/index.js";

/** Executable post-start resource-support branch. */
const support = createDomainSubdomainRouter(contract, {
  adjustResourceSupport,
});

export default support;
