import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable resource-habitat branch. */
const habitat = createDomainSubdomainRouter(contract, implementations);

export default habitat;
