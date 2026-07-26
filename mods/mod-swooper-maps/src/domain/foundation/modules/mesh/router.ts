import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Foundation mesh branch. */
const mesh = createDomainSubdomainRouter(contract, implementations);

export default mesh;
