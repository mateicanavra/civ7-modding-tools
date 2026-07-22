import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreIceContract from "./contract.js";
import { thermalElevationStrategy } from "./strategies/index.js";

const scoreIce = createOp(ScoreIceContract, {
  strategies: {
    "thermal-elevation": thermalElevationStrategy,
  },
});

export type * from "./contract.js";

export default scoreIce;
