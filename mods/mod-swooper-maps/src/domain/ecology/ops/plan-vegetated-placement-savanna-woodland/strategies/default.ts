import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSavannaWoodlandContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForSavannaWoodland,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(
  PlanVegetatedPlacementSavannaWoodlandContract,
  "default",
  {
    normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
    run: (input, config) =>
      planVegetatedFeaturePlacementsForSavannaWoodland({ input, config }),
  }
);
