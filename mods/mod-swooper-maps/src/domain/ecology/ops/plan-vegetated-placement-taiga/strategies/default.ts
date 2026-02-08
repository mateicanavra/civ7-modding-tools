import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementTaigaContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForTaiga,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanVegetatedPlacementTaigaContract, "default", {
  normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
  run: (input, config) => planVegetatedFeaturePlacementsForTaiga({ input, config }),
});
