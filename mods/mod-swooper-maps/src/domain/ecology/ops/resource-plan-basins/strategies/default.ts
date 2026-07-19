import { createStrategy } from "@swooper/mapgen-core/authoring";
import ResourcePlanBasinsContract from "../contract.js";
import { planResourceBasins } from "../rules/index.js";
export const defaultStrategy = createStrategy(ResourcePlanBasinsContract, "default", {
  run: planResourceBasins,
});
