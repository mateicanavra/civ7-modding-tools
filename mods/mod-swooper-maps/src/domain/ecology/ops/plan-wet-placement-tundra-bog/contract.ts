import { defineOp } from "@swooper/mapgen-core/authoring";

import PlanWetFeaturePlacementsContract from "../plan-wet-feature-placements/contract.js";

const PlanWetPlacementTundraBogContract = defineOp({
  kind: "plan",
  id: "ecology/features/wet-placement/tundra-bog",
  input: PlanWetFeaturePlacementsContract.input,
  output: PlanWetFeaturePlacementsContract.output,
  strategies: PlanWetFeaturePlacementsContract.strategies,
});

export default PlanWetPlacementTundraBogContract;

