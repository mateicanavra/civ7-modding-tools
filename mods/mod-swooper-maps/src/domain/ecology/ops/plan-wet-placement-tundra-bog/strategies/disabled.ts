import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementTundraBogContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanWetPlacementTundraBogContract, "disabled", {
  run: () => ({ placements: [] }),
});

