import { defineOp } from "@swooper/mapgen-core/authoring";

import { WetFeaturePlacementsContractParts } from "../../shared/wet-feature-placements/contract-parts.js";

const PlanWetPlacementMarshContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/marsh",
  input: WetFeaturePlacementsContractParts.input,
  output: WetFeaturePlacementsContractParts.output,
  strategies: WetFeaturePlacementsContractParts.strategies,
});

export default PlanWetPlacementMarshContract;
