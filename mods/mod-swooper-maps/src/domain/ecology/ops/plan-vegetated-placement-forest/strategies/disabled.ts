import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementForestContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanVegetatedPlacementForestContract, "disabled", {
  run: () => ({ placements: [] }),
});

