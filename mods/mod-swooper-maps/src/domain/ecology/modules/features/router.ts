import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Ecology feature branch. */
const features = createDomainSubdomainRouter(contract, implementations);

export default features;
