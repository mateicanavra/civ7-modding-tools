import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Morphology landforms branch bound to its admitted operation implementations. */
const landforms = createDomainSubdomainRouter(contract, implementations);
export default landforms;
