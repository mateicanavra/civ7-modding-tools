import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMangroveContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForMangrove,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementMangroveContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) => planWetFeaturePlacementsForMangrove({ input, config }),
});
