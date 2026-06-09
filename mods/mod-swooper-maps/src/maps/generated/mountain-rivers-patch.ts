/**
 * Generated from ../configs/mountain-rivers-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-rivers-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-rivers-patch",
  configHash: "6a1850c153c4a396d85eda5e0ed9f84f45c093b032980b8426bec6289f13cfbd",
  envelopeHash: "93455f7a97bac83d012e477fffd59aed6781915acf381e8f2ba4d16a472263ba",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
