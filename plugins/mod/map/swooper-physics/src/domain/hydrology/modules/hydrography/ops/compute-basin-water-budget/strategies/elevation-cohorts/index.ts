import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeBasinWaterBudgetContract from "../../contract.js";
import { computeBasinWaterBudget } from "../../rules/index.js";
import ElevationCohortsDefinition from "./config.js";

/** Delegates one catchment to the cohort scan, retaining quantized residuals and unsupported surplus evidence. */
export default createStrategy(ComputeBasinWaterBudgetContract, ElevationCohortsDefinition, {
  run: (input) => computeBasinWaterBudget(input),
});
