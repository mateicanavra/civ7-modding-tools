import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Morphology routing branch bound to the admitted flow-routing implementation. */
const routing = createDomainSubdomainRouter(contract, implementations);
export default routing;
