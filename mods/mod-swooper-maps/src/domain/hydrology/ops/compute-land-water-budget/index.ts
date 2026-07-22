import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeLandWaterBudgetContract from "./contract.js";
import { petAridityStrategy } from "./strategies/index.js";

const computeLandWaterBudget = createOp(ComputeLandWaterBudgetContract, {
  strategies: { "pet-aridity": petAridityStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeLandWaterBudget;
