import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementTaigaContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/taiga",
  input: PlanVegetatedFeaturePlacementsContract.input,
  output: PlanVegetatedFeaturePlacementsContract.output,
  strategies: PlanVegetatedFeaturePlacementsContract.strategies,
});

export default PlanVegetatedPlacementTaigaContract;

