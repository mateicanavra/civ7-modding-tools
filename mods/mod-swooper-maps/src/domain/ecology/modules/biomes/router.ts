import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import classifyBiomes from "./ops/classify-biomes/index.js";

/** Executable Ecology biome branch. */
const biomes = createDomainSubdomainRouter(contract, {
  classifyBiomes,
});

export default biomes;
