import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSagebrushSteppeContract from "../contract.js";
import {
  normalizeVegetatedFeaturePlacementsConfig,
  planVegetatedFeaturePlacementsForSagebrushSteppe,
} from "../../plan-vegetated-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(
  PlanVegetatedPlacementSagebrushSteppeContract,
  "default",
  {
    normalize: (config) => normalizeVegetatedFeaturePlacementsConfig(config),
    run: (input, config) =>
      planVegetatedFeaturePlacementsForSagebrushSteppe({ input, config }),
  }
);
