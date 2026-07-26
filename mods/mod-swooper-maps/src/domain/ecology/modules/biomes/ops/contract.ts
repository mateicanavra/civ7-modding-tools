import BiomeClassificationContract from "./classify-biomes/contract.js";

/** Biome operation contracts keyed in causal execution order. */
const contracts = {
  classifyBiomes: BiomeClassificationContract,
} as const;

export default contracts;
