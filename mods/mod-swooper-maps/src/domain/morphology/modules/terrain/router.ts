import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Morphology terrain branch bound to its admitted operation implementations. */
const terrain = createDomainSubdomainRouter(contract, implementations);
export default terrain;
