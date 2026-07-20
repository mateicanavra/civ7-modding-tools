import { createStrategy } from "@swooper/mapgen-core/authoring";
import ResourcePlanBasinsContract from "../contract.js";
import { planResourceBasins } from "../rules/index.js";

/** Applies every resource family's authored fertility and moisture biases without amplification. */
export const balancedStrategy = createStrategy(ResourcePlanBasinsContract, "balanced", {
  run: planResourceBasins,
});
