import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable resource-demand branch. */
const demand = createDomainSubdomainRouter(contract, implementations);

export default demand;
