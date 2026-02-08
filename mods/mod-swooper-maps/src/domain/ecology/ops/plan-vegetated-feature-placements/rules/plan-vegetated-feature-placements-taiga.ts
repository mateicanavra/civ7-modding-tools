import type { VegetatedFeaturePlacementsPlanArgs } from "./plan-vegetated-feature-placements-shared.js";
import { planVegetatedFeaturePlacementsShared } from "./plan-vegetated-feature-placements-shared.js";

export function planVegetatedFeaturePlacementsForTaiga(args: VegetatedFeaturePlacementsPlanArgs) {
  return planVegetatedFeaturePlacementsShared({ ...args, featureKey: "FEATURE_TAIGA" });
}

