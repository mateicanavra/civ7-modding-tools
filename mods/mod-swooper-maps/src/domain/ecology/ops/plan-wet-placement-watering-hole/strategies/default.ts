import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementWateringHoleContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForFeature,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementWateringHoleContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) =>
    planWetFeaturePlacementsForFeature({ input, config, featureKey: "FEATURE_WATERING_HOLE" }),
});

