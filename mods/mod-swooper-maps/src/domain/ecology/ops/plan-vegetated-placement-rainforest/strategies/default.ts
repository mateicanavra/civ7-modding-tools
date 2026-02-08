import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementRainforestContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForFeature,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetatedPlacementRainforestContract, "default", {
  normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
  run: (input, config) =>
    planVegetatedFeaturePlacementsForFeature({
      input,
      config,
      featureKey: "FEATURE_RAINFOREST",
    }),
});

