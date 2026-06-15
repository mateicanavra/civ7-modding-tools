import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeLandWaterBudgetContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeLandWaterBudget = createOp(ComputeLandWaterBudgetContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeLandWaterBudget;
