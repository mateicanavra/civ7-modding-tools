import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Hydrology hydrography branch. */
const hydrography = createDomainSubdomainRouter(contract, implementations);

export default hydrography;
