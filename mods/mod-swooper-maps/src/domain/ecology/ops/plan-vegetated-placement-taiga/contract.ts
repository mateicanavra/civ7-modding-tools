import { defineOp } from "@swooper/mapgen-core/authoring";

import { VegetatedFeaturePlacementsContractParts } from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementTaigaContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/taiga",
  input: VegetatedFeaturePlacementsContractParts.input,
  output: VegetatedFeaturePlacementsContractParts.output,
  strategies: VegetatedFeaturePlacementsContractParts.strategies,
});

export default PlanVegetatedPlacementTaigaContract;
