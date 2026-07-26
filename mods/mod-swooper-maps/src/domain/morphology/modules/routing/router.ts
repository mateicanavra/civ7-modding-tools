import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeFlowRouting from "./ops/compute-flow-routing/index.js";

/** Executable Morphology routing branch bound to the admitted flow-routing implementation. */
const routing = createDomainSubdomainRouter(contract, {
  computeFlowRouting,
});
export default routing;
