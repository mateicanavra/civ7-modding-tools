import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Placement wonders branch used by wonder-planning recipe steps. */
const wonders = createDomainSubdomainRouter(contract, implementations);

export default wonders;
