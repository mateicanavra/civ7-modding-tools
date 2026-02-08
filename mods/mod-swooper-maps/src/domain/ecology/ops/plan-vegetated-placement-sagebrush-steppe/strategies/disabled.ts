import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSagebrushSteppeContract from "../contract.js";

export const disabledStrategy = createStrategy(
  PlanVegetatedPlacementSagebrushSteppeContract,
  "disabled",
  { run: () => ({ placements: [] }) }
);

