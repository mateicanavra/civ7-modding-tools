import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Morphology shelf branch bound to the admitted shelf-mask implementation. */
const shelf = createDomainSubdomainRouter(contract, implementations);
export default shelf;
