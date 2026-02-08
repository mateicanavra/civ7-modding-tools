import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementSavannaWoodlandContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/savanna-woodland",
  input: PlanVegetatedFeaturePlacementsContract.input,
  output: PlanVegetatedFeaturePlacementsContract.output,
  strategies: PlanVegetatedFeaturePlacementsContract.strategies,
});

export default PlanVegetatedPlacementSavannaWoodlandContract;

