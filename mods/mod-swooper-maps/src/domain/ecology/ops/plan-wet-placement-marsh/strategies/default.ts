import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMarshContract from "../contract.js";
import {
  normalizeWetFeaturePlacementsConfig,
  planWetFeaturePlacementsForMarsh,
} from "../../plan-wet-feature-placements/rules/index.js";

export const defaultStrategy = createStrategy(PlanWetPlacementMarshContract, "default", {
  normalize: (config) => normalizeWetFeaturePlacementsConfig(config),
  run: (input, config) => planWetFeaturePlacementsForMarsh({ input, config }),
});
