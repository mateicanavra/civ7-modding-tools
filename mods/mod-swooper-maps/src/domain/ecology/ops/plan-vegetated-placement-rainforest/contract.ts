import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementRainforestContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/rainforest",
  input: PlanVegetatedFeaturePlacementsContract.input,
  output: PlanVegetatedFeaturePlacementsContract.output,
  strategies: PlanVegetatedFeaturePlacementsContract.strategies,
});

export default PlanVegetatedPlacementRainforestContract;

