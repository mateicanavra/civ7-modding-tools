import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementWateringHoleContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanWetPlacementWateringHoleContract, "disabled", {
  run: () => ({ placements: [] }),
});

