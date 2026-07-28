import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import adjustResourceSupport from "./ops/adjust-resource-support/index.js";

/**
 * Canonically binds the Support contract to post-start adjustment of authoritative resource intent
 * so player support is added without bypassing the resource plan. The Resources router is the sole
 * executable aggregate; step authoring continues to reference the contract.
 */
const support = createDomainSubdomainRouter(contract, {
  adjustResourceSupport,
});

export default support;
