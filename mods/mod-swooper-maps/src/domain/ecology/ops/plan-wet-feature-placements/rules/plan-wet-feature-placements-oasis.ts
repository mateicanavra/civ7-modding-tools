import type { WetFeaturePlacementsPlanArgs } from "./plan-wet-feature-placements-shared.js";
import { planWetFeaturePlacementsShared } from "./plan-wet-feature-placements-shared.js";

export function planWetFeaturePlacementsForOasis(
  args: WetFeaturePlacementsPlanArgs
){
  return planWetFeaturePlacementsShared({ ...args, featureKey: "FEATURE_OASIS" });
}
