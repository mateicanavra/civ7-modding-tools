import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCoastalAdjacencyContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeCoastalAdjacency = createOp(ComputeCoastalAdjacencyContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default computeCoastalAdjacency;
