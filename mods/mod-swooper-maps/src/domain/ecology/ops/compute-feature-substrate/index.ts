import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeFeatureSubstrateContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeFeatureSubstrate = createOp(ComputeFeatureSubstrateContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default computeFeatureSubstrate;

