import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetationSagebrushSteppeContract from "../contract.js";
import { planVegetationFeaturePlacements } from "../../features-plan-vegetation/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetationSagebrushSteppeContract, "default", {
  run: (input, config) =>
    planVegetationFeaturePlacements({
      input,
      config,
      mode: "default",
      featureKey: "FEATURE_SAGEBRUSH_STEPPE",
    }),
});

