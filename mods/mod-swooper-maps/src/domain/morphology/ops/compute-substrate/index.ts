import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSubstrateContract from "./contract.js";
import { crustBoundaryMaterialStrategy } from "./strategies/index.js";

const computeSubstrate = createOp(ComputeSubstrateContract, {
  strategies: {
    "crust-boundary-material": crustBoundaryMaterialStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeSubstrate;
