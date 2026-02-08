import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationTaigaContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const clusteredStrategy = createStrategy(PlanVegetationTaigaContract, "clustered", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "clustered",
      featureKey: "FEATURE_TAIGA",
    }),
});

