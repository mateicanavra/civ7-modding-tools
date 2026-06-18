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
  configHash: "e4c2fb8cf1740ed089d40e9e6d0c045e8bcb7f693302d83c71ecceb688c503da",
  envelopeHash: "9fb2c3857aeb891946840bb70eca52b1d446d3d7327951ba4c4dd30f8ffe13f8",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
