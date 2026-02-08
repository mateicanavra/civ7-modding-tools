import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementTundraBogContract from "../contract.js";
import { normalizePlanWetPlacementTundraBogConfig } from "../rules/normalize-config.js";
import { planWetPlacementTundraBog } from "../rules/plan-wet-placement-tundra-bog.js";

export const defaultStrategy = createStrategy(PlanWetPlacementTundraBogContract, "default", {
  normalize: (config) => normalizePlanWetPlacementTundraBogConfig(config),
  run: (input, config) => planWetPlacementTundraBog(input, config),
});
