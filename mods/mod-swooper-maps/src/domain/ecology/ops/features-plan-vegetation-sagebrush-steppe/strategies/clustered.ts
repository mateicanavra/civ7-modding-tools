import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationSagebrushSteppeContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const clusteredStrategy = createStrategy(PlanVegetationSagebrushSteppeContract, "clustered", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "clustered",
      featureKey: "FEATURE_SAGEBRUSH_STEPPE",
    }),
});

