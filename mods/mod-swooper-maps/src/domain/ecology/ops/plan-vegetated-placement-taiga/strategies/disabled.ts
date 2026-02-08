import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementTaigaContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanVegetatedPlacementTaigaContract, "disabled", {
  run: () => ({ placements: [] }),
});

