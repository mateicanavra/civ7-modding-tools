import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import BiomeClassificationContract from "./ops/classify-biomes/contract.js";

/** Biome branch contract for classification and deterministic edge refinement. */
const biomes = defineDomainSubdomain({
  id: "biomes",
  ops: {
    classifyBiomes: BiomeClassificationContract,
  },
});

export default biomes;
