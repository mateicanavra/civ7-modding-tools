import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMangroveContract from "../contract.js";
import { normalizePlanWetPlacementMangroveConfig } from "../rules/normalize-config.js";
import { planWetPlacementMangrove } from "../rules/plan-wet-placement-mangrove.js";

export const defaultStrategy = createStrategy(PlanWetPlacementMangroveContract, "default", {
  normalize: (config) => normalizePlanWetPlacementMangroveConfig(config),
  run: (input, config) => planWetPlacementMangrove(input, config),
});
