import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMarshContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanWetPlacementMarshContract, "disabled", {
  run: () => ({ placements: [] }),
});

