import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlateTopologyContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computePlateTopology = createOp(ComputePlateTopologyContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computePlateTopology;
