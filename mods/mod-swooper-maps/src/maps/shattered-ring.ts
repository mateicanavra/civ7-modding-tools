/**
 * The Shattered Ring — Post-impact crater world (TypeScript)
 *
 * A world forever changed by an ancient asteroid impact:
 * - Central crater sea (~62% water) with volcanic islands
 * - Ring mountains from impact shockwave upheaval
 * - Radial geography with diverse climate zones
 * - Three theaters: inner sea (naval), ring (defensive), outer lands (expansive)
 *
 * Designed by Claude Code's map-designer agent.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@swooper/mapgen-core/authoring/maps";
import standardRecipe from "../recipes/standard/recipe.js";
import { SHATTERED_RING_CONFIG } from "./configs/shattered-ring.config.js";

export default createMap({
  id: "shattered-ring",
  name: "The Shattered Ring",
  recipe: standardRecipe,
  config: SHATTERED_RING_CONFIG,
});
