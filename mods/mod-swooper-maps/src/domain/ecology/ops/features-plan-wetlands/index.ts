import { createOp } from "@swooper/mapgen-core/authoring";
import PlanWetlandsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planWetlands = createOp(PlanWetlandsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planWetlands;
