import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementForestContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForForest,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetatedPlacementForestContract, "default", {
  normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
  run: (input, config) => planVegetatedFeaturePlacementsForForest({ input, config }),
});
