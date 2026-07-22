import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeVegetationSubstrateContract from "./contract.js";
import { bioclimaticSubstrateStrategy } from "./strategies/index.js";

const computeVegetationSubstrate = createOp(ComputeVegetationSubstrateContract, {
  strategies: {
    "bioclimatic-substrate": bioclimaticSubstrateStrategy,
  },
});

export type * from "./contract.js";

export default computeVegetationSubstrate;
