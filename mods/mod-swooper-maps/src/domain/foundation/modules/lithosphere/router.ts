import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Foundation lithosphere branch. */
const lithosphere = createDomainSubdomainRouter(contract, implementations);

export default lithosphere;
