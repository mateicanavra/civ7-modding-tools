import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlateTopologyContract from "./contract.js";
import { wrappedHexAdjacencyStrategy } from "./strategies/index.js";

/**
 * Projects plate membership into wrapped-hex neighborhood topology for tile-facing consumers.
 * The operation keeps projection mechanics separate from the lithosphere's plate identity model.
 */
const computePlateTopology = createOp(ComputePlateTopologyContract, {
  strategies: {
    "wrapped-hex-adjacency": wrappedHexAdjacencyStrategy,
  },
});

export default computePlateTopology;
