import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSagebrushSteppeContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForFeature,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(
  PlanVegetatedPlacementSagebrushSteppeContract,
  "default",
  {
    normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
    run: (input, config) =>
      planVegetatedFeaturePlacementsForFeature({
        input,
        config,
        featureKey: "FEATURE_SAGEBRUSH_STEPPE",
      }),
  }
);

