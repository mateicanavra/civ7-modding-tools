import { defineOp } from "@swooper/mapgen-core/authoring";

import { VegetatedFeaturePlacementsContractParts } from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementSagebrushSteppeContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/sagebrush-steppe",
  input: VegetatedFeaturePlacementsContractParts.input,
  output: VegetatedFeaturePlacementsContractParts.output,
  strategies: VegetatedFeaturePlacementsContractParts.strategies,
});

export default PlanVegetatedPlacementSagebrushSteppeContract;
