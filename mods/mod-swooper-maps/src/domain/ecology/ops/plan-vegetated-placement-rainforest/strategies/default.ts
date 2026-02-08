import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementRainforestContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForRainforest,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetatedPlacementRainforestContract, "default", {
  normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
  run: (input, config) => planVegetatedFeaturePlacementsForRainforest({ input, config }),
});
