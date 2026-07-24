import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Hydrology ocean branch. */
const ocean = createDomainSubdomainRouter(contract, implementations);

export default ocean;
