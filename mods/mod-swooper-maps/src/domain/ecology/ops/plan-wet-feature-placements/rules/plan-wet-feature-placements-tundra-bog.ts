import type { WetFeaturePlacementsPlanArgs } from "./plan-wet-feature-placements-shared.js";
import { planWetFeaturePlacementsShared } from "./plan-wet-feature-placements-shared.js";

export function planWetFeaturePlacementsForTundraBog(
  args: WetFeaturePlacementsPlanArgs
){
  return planWetFeaturePlacementsShared({ ...args, featureKey: "FEATURE_TUNDRA_BOG" });
}
