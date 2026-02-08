import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementOasisContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForOasis,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementOasisContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) => planWetFeaturePlacementsForOasis({ input, config }),
});
