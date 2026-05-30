/**
 * Swooper Earthlike — Realistic, plate-driven Earth analogue (TypeScript)
 *
 * Goals:
 * - Ocean-dominant world (~70% water)
 * - Few large continents with a mix of active (Pacific-like) and passive (Atlantic-like) margins
 * - Earth-like latitude rainfall bands, with subtropical deserts and wet tropics
 * - Moderate coastal moisture spread and low-frequency rainfall noise
 */

/// <reference types="@civ7/types" />

import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../recipes/standard/recipe.js";
import standardRecipe from "../recipes/standard/recipe.js";
import swooperEarthlikeConfigRaw from "./configs/swooper-earthlike.config.json";

export default createMap({
  id: "swooper-earthlike",
  name: "Swooper Earthlike",
  recipe: standardRecipe,
  config: stripSchemaMetadataRoot(swooperEarthlikeConfigRaw) as StandardRecipeConfig,
});
