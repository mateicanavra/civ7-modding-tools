import { defineOp } from "@swooper/mapgen-core/authoring";

import { VegetatedFeaturePlacementsContractParts } from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementForestContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/forest",
  input: VegetatedFeaturePlacementsContractParts.input,
  output: VegetatedFeaturePlacementsContractParts.output,
  strategies: VegetatedFeaturePlacementsContractParts.strategies,
});

export default PlanVegetatedPlacementForestContract;
