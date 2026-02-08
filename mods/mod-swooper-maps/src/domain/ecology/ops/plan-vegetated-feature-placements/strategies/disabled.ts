import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../contract.js";

export const disabledStrategy = createStrategy(PlanVegetatedFeaturePlacementsContract, "disabled", {
  run: () => ({ placements: [] }),
});

