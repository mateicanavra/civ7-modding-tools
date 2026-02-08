import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMarshContract from "../contract.js";
import { normalizePlanWetPlacementMarshConfig } from "../rules/normalize-config.js";
import { planWetPlacementMarsh } from "../rules/plan-wet-placement-marsh.js";

export const defaultStrategy = createStrategy(PlanWetPlacementMarshContract, "default", {
  normalize: (config) => normalizePlanWetPlacementMarshConfig(config),
  run: (input, config) => planWetPlacementMarsh(input, config),
});
