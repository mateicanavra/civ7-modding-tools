import { defineOp } from "@swooper/mapgen-core/authoring";

import { WetFeaturePlacementsContractParts } from "../plan-wet-feature-placements/contract.js";

const PlanWetPlacementOasisContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/oasis",
  input: WetFeaturePlacementsContractParts.input,
  output: WetFeaturePlacementsContractParts.output,
  strategies: WetFeaturePlacementsContractParts.strategies,
});

export default PlanWetPlacementOasisContract;
