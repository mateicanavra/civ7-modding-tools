import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Hydrology cryosphere branch. */
const cryosphere = createDomainSubdomainRouter(contract, implementations);

export default cryosphere;
