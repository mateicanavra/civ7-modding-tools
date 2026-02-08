import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeVegetationSubstrateContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeVegetationSubstrate = createOp(ComputeVegetationSubstrateContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default computeVegetationSubstrate;

