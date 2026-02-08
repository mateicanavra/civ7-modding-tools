import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanWetFeaturePlacementsContract from "../plan-wet-feature-placements/contract.js";

const PlanWetPlacementMarshContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/marsh",
  input: PlanWetFeaturePlacementsContract.input,
  output: PlanWetFeaturePlacementsContract.output,
  strategies: PlanWetFeaturePlacementsContract.strategies,
});

export default PlanWetPlacementMarshContract;

