import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementOasisContract from "../contract.js";
import { normalizePlanWetPlacementOasisConfig } from "../rules/normalize-config.js";
import { planWetPlacementOasis } from "../rules/plan-wet-placement-oasis.js";

export const defaultStrategy = createStrategy(PlanWetPlacementOasisContract, "default", {
  normalize: (config) => normalizePlanWetPlacementOasisConfig(config),
  run: (input, config) => planWetPlacementOasis(input, config),
});
