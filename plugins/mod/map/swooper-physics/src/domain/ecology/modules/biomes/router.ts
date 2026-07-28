import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import classifyBiomes from "./ops/classify-biomes/index.js";

/**
 * Canonically binds the Biomes contract to classification that turns climate, soil, and terrain
 * evidence into biome truth. The Ecology router is the sole executable aggregate; step authoring
 * continues to reference the contract.
 */
const biomes = createDomainSubdomainRouter(contract, {
  classifyBiomes,
});

export default biomes;
