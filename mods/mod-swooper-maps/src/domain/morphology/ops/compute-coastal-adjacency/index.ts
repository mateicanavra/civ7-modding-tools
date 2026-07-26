import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCoastalAdjacencyContract from "./contract.js";
import { wrappedHexAdjacencyStrategy } from "./strategies/index.js";

const computeCoastalAdjacency = createOp(ComputeCoastalAdjacencyContract, {
  strategies: {
    "wrapped-hex-adjacency": wrappedHexAdjacencyStrategy,
  },
});

export type * from "./contract.js";

export default computeCoastalAdjacency;
