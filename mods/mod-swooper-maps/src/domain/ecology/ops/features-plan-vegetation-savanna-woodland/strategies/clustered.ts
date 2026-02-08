import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationSavannaWoodlandContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const clusteredStrategy = createStrategy(PlanVegetationSavannaWoodlandContract, "clustered", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "clustered",
      featureKey: "FEATURE_SAVANNA_WOODLAND",
    }),
});

