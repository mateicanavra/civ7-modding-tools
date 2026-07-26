import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import implementations from "./ops/index.js";

/** Executable Ecology biome branch. */
const biomes = createDomainSubdomainRouter(contract, implementations);

export default biomes;
