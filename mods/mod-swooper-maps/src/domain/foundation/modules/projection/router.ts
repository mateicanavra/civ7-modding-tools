import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Foundation projection branch. */
const projection = createDomainSubdomainRouter(contract, implementations);

export default projection;
