import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanVegetatedPlacementRainforestContract from "../contract.js";

export const disabledStrategy = createStrategy(
  PlanVegetatedPlacementRainforestContract,
  "disabled",
  { run: () => ({ placements: [] }) }
);

