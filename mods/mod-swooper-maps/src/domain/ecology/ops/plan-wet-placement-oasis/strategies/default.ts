import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementOasisContract from "../contract.js";
import { normalizeWetFeaturePlacementsConfig } from "../../../shared/wet-feature-placements/normalize-config.js";
import { planWetFeaturePlacementsShared } from "../../../shared/wet-feature-placements/plan-wet-feature-placements-shared.js";

export const defaultStrategy = createStrategy(PlanWetPlacementOasisContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) =>
    planWetFeaturePlacementsShared({ input, config, featureKey: "FEATURE_OASIS" }),
});
