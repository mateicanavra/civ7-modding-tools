import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMangroveContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForFeature,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementMangroveContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) =>
    planWetFeaturePlacementsForFeature({ input, config, featureKey: "FEATURE_MANGROVE" }),
});

