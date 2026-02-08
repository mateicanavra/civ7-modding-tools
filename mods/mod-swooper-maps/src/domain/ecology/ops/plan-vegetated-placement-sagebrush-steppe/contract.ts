import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementSagebrushSteppeContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/sagebrush-steppe",
  input: PlanVegetatedFeaturePlacementsContract.input,
  output: PlanVegetatedFeaturePlacementsContract.output,
  strategies: PlanVegetatedFeaturePlacementsContract.strategies,
});

export default PlanVegetatedPlacementSagebrushSteppeContract;

