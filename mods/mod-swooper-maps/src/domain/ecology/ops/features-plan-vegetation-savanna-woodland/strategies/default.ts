import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationSavannaWoodlandContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetationSavannaWoodlandContract, "default", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "default",
      featureKey: "FEATURE_SAVANNA_WOODLAND",
    }),
});

