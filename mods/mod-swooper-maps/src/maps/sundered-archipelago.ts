/**
 * The Sundered Archipelago — Volcanic island chains and sunken continents (TypeScript)
 *
 * A world where massive tectonic rifting has shattered ancient continents:
 * - Hundreds of islands rather than continents (~82% water)
 * - Volcanic chains from active hotspots and subduction zones
 * - Shallow seas with coral reefs connecting island clusters
 * - Strategic straits and maritime corridors
 *
 * Designed by Claude Code's map-designer agent.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@swooper/mapgen-core/authoring/maps";
import standardRecipe from "../recipes/standard/recipe.js";
import { SUNDERED_ARCHIPELAGO_CONFIG } from "./configs/sundered-archipelago.config.js";

export default createMap({
  id: "sundered-archipelago",
  name: "The Sundered Archipelago",
  recipe: standardRecipe,
  config: SUNDERED_ARCHIPELAGO_CONFIG,
});
