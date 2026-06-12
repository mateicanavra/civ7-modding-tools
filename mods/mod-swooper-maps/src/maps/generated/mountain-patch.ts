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
  configHash: "9413b543a98c56a86555d413b03521109a73567b7350bdead7fb9f6298f30341",
  envelopeHash: "d71bf68d6c02e21ee24d9a6bd4469de7d6a3ad77484aa1da49fe01d60f4d01c3",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
