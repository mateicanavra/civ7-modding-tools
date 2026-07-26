import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeFlowRouting from "./ops/compute-flow-routing/index.js";

/**
 * Canonically binds the Routing contract to receiver and drainage derivation over carved relief,
 * supplying the flow topology used by geomorphic evolution. The Morphology router is the sole
 * executable aggregate; step authoring continues to reference the contract.
 */
const routing = createDomainSubdomainRouter(contract, {
  computeFlowRouting,
});
export default routing;
