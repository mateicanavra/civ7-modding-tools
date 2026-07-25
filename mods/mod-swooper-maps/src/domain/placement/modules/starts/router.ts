import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Placement starts branch used by start-assignment recipe steps. */
const starts = createDomainSubdomainRouter(contract, implementations);

export default starts;
