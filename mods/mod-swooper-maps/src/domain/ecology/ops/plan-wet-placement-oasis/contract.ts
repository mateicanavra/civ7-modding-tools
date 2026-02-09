import { defineOp } from "@swooper/mapgen-core/authoring";

import { WetFeaturePlacementsContractParts } from "../../shared/wet-feature-placements/contract-parts.js";

const PlanWetPlacementOasisContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/oasis",
  input: WetFeaturePlacementsContractParts.input,
  output: WetFeaturePlacementsContractParts.output,
  strategies: WetFeaturePlacementsContractParts.strategies,
});

export default PlanWetPlacementOasisContract;
