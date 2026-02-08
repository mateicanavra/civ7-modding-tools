import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMangroveContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanWetPlacementMangroveContract, "disabled", {
  run: () => ({ placements: [] }),
});

