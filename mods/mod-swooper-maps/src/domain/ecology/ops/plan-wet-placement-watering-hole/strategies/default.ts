import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementWateringHoleContract from "../contract.js";
import { normalizePlanWetPlacementWateringHoleConfig } from "../rules/normalize-config.js";
import { planWetPlacementWateringHole } from "../rules/plan-wet-placement-watering-hole.js";

export const defaultStrategy = createStrategy(PlanWetPlacementWateringHoleContract, "default", {
  normalize: (config) => normalizePlanWetPlacementWateringHoleConfig(config),
  run: (input, config) => planWetPlacementWateringHole(input, config),
});
