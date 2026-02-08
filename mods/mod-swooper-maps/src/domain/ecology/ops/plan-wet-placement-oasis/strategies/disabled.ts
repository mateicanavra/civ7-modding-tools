import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementOasisContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanWetPlacementOasisContract, "disabled", {
  run: () => ({ placements: [] }),
});

