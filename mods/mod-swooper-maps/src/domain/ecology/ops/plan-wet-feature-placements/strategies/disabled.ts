import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetFeaturePlacementsContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanWetFeaturePlacementsContract, "disabled", {
  run: () => ({ placements: [] }),
});

