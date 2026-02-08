import type { VegetatedFeaturePlacementsPlanArgs } from "./plan-vegetated-feature-placements-shared.js";
import { planVegetatedFeaturePlacementsShared } from "./plan-vegetated-feature-placements-shared.js";

export function planVegetatedFeaturePlacementsForForest(args: VegetatedFeaturePlacementsPlanArgs) {
  return planVegetatedFeaturePlacementsShared({ ...args, featureKey: "FEATURE_FOREST" });
}

