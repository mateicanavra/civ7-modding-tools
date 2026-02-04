/**
 * Swooper Desert Mountains — Hyper-arid, plate-driven world (TypeScript)
 *
 * REFACTORED CONFIGURATION:
 * This version uses a completely standard, balanced configuration to eliminate
 * extreme mountain generation and start failures.
 *
 * It uses the RunRequest → ExecutionPlan pipeline from @swooper/mapgen-core.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@swooper/mapgen-core/authoring/maps";
import standardRecipe from "../recipes/standard/recipe.js";
import { SWOOPER_DESERT_MOUNTAINS_CONFIG } from "./configs/swooper-desert-mountains.config.js";

export default createMap({
  id: "swooper-desert-mountains",
  name: "Swooper Desert Mountains",
  recipe: standardRecipe,
  latitudeBounds: {
    topLatitude: 40,
    bottomLatitude: -40,
  },
  config: SWOOPER_DESERT_MOUNTAINS_CONFIG,
});
