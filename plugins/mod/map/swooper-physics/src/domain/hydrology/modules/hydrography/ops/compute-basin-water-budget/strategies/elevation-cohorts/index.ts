import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeBasinWaterBudgetContract from "../../contract.js";
import { computeBasinWaterBudget } from "../../rules/index.js";
import ElevationCohortsDefinition from "./config.js";

export default createStrategy(ComputeBasinWaterBudgetContract, ElevationCohortsDefinition, {
  run: (input) => computeBasinWaterBudget(input),
});
