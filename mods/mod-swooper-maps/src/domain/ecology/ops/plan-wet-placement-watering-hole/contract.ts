import { defineOp } from "@swooper/mapgen-core/authoring";

import { WetFeaturePlacementsContractParts } from "../plan-wet-feature-placements/contract.js";

const PlanWetPlacementWateringHoleContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/watering-hole",
  input: WetFeaturePlacementsContractParts.input,
  output: WetFeaturePlacementsContractParts.output,
  strategies: WetFeaturePlacementsContractParts.strategies,
});

export default PlanWetPlacementWateringHoleContract;
