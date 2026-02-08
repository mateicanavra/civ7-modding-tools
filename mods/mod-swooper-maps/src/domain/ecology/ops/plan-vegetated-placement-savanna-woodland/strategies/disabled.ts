import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementSavannaWoodlandContract from "../contract.js";

export const disabledStrategy = createStrategy(
  PlanVegetatedPlacementSavannaWoodlandContract,
  "disabled",
  { run: () => ({ placements: [] }) }
);

