import { defineOp } from "@swooper/mapgen-core/authoring";

import { VegetatedFeaturePlacementsContractParts } from "../plan-vegetated-feature-placements/contract.js";

const PlanVegetatedPlacementRainforestContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetated-placement/rainforest",
  input: VegetatedFeaturePlacementsContractParts.input,
  output: VegetatedFeaturePlacementsContractParts.output,
  strategies: VegetatedFeaturePlacementsContractParts.strategies,
});

export default PlanVegetatedPlacementRainforestContract;
