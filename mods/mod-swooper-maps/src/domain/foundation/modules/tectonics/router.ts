import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Foundation tectonics branch. */
const tectonics = createDomainSubdomainRouter(contract, implementations);

export default tectonics;
