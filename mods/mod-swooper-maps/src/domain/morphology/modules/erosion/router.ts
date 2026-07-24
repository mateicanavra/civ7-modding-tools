import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Morphology erosion branch bound to its geomorphic-cycle implementation. */
const erosion = createDomainSubdomainRouter(contract, implementations);
export default erosion;
