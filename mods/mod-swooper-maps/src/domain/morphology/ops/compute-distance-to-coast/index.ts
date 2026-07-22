import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDistanceToCoastContract from "./contract.js";
import { multiSourceHexBfsStrategy } from "./strategies/index.js";

const computeDistanceToCoast = createOp(ComputeDistanceToCoastContract, {
  strategies: {
    "multi-source-hex-bfs": multiSourceHexBfsStrategy,
  },
});

export type * from "./contract.js";

export default computeDistanceToCoast;
