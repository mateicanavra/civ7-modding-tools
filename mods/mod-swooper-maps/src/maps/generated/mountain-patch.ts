/**
 * Generated from ../configs/mountain-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-patch",
  configHash: "236811a417bffd99ef4ec3e9dd913f91e6030dd6ffa84d6474639cc1cbba5f57",
  envelopeHash: "53ca7c5ea12709fdf928a3c286b8898cb928861fefffb55e634ef6d0417f0a63",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
