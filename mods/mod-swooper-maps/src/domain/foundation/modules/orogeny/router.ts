import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Foundation orogeny branch. */
const orogeny = createDomainSubdomainRouter(contract, implementations);

export default orogeny;
