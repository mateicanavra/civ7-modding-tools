import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationRainforestContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetationRainforestContract, "default", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "default",
      featureKey: "FEATURE_RAINFOREST",
    }),
});

