import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Foundation mantle branch. */
const mantle = createDomainSubdomainRouter(contract, implementations);

export default mantle;
