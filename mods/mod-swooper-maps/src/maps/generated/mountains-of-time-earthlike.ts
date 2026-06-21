/**
 * Generated from ../configs/mountains-of-time-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-earthlike",
  configHash: "1e39cea63b27893fb7e8edb13dabc74baeea78aeeba3bcf994eab6729abe9aed",
  envelopeHash: "25cef541753d69a849cb6e8a0a004e38d2c90028ad86d8ee6e3a6eef5cc1556b",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
