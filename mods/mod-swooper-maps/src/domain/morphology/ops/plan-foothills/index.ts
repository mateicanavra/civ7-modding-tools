import { createOp } from "@swooper/mapgen-core/authoring";

import PlanFoothillsContract from "./contract.js";
import { mountainProximityStrategy } from "./strategies/index.js";

const planFoothills = createOp(PlanFoothillsContract, {
  strategies: {
    "mountain-proximity": mountainProximityStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planFoothills;
