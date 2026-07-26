import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Ecology plot-effect branch. */
const plotEffects = createDomainSubdomainRouter(contract, implementations);

export default plotEffects;
