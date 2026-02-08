import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementTundraBogContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForTundraBog,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementTundraBogContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) => planWetFeaturePlacementsForTundraBog({ input, config }),
});
