import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationForestContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const clusteredStrategy = createStrategy(PlanVegetationForestContract, "clustered", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "clustered",
      featureKey: "FEATURE_FOREST",
    }),
});

