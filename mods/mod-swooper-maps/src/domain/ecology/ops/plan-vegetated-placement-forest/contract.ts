import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementForestContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/forest",
  input: PlanVegetatedFeaturePlacementsContract.input,
  output: PlanVegetatedFeaturePlacementsContract.output,
  strategies: PlanVegetatedFeaturePlacementsContract.strategies,
});

export default PlanVegetatedPlacementForestContract;

