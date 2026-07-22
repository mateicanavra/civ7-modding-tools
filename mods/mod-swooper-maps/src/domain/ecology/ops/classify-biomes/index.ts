import { createOp } from "@swooper/mapgen-core/authoring";

import BiomeClassificationContract from "./contract.js";
import { biophysicalGaussianStrategy } from "./strategies/index.js";

const classifyBiomes = createOp(BiomeClassificationContract, {
  strategies: {
    "biophysical-gaussian": biophysicalGaussianStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default classifyBiomes;
