import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Ecology pedology branch. */
const pedology = createDomainSubdomainRouter(contract, implementations);

export default pedology;
