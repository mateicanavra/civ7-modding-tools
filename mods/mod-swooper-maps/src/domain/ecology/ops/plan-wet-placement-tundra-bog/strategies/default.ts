import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementTundraBogContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForFeature,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementTundraBogContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) =>
    planWetFeaturePlacementsForFeature({ input, config, featureKey: "FEATURE_TUNDRA_BOG" }),
});

