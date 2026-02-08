import { defineOp } from "@swooper/mapgen-core/authoring";

import { WetFeaturePlacementsContractParts } from "../plan-wet-feature-placements/contract.js";

const PlanWetPlacementMangroveContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/mangrove",
  input: WetFeaturePlacementsContractParts.input,
  output: WetFeaturePlacementsContractParts.output,
  strategies: WetFeaturePlacementsContractParts.strategies,
});

export default PlanWetPlacementMangroveContract;
