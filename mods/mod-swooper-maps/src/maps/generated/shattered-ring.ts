/**
 * Generated from ../configs/shattered-ring.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/shattered-ring.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "shattered-ring",
  configHash: "6df62f2c03691d86712b4a0cc255a6ac4d8538ed4f4416b61277f1383a755c8d",
  envelopeHash: "23d3259620dd415f39ba3edad29d88eea5aabdef739d4ad4a4ec6718c185d327",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
