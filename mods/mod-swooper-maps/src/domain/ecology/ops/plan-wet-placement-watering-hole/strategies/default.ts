import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementWateringHoleContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForWateringHole,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementWateringHoleContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) => planWetFeaturePlacementsForWateringHole({ input, config }),
});
