import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeFeatureSubstrateContract from "./contract.js";
import { hydromorphicStrategy } from "./strategies/index.js";

const computeFeatureSubstrate = createOp(ComputeFeatureSubstrateContract, {
  strategies: {
    hydromorphic: hydromorphicStrategy,
  },
});

export type * from "./contract.js";

export default computeFeatureSubstrate;
