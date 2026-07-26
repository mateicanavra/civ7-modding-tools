import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlateTopologyContract from "./contract.js";
import { wrappedHexAdjacencyStrategy } from "./strategies/index.js";

const computePlateTopology = createOp(ComputePlateTopologyContract, {
  strategies: {
    "wrapped-hex-adjacency": wrappedHexAdjacencyStrategy,
  },
});

export default computePlateTopology;
