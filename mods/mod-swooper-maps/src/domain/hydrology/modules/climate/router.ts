import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Hydrology climate branch. */
const climate = createDomainSubdomainRouter(contract, implementations);

export default climate;
