import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationForestContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetationForestContract, "default", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "default",
      featureKey: "FEATURE_FOREST",
    }),
});

