/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/latest-juicy.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "e39d95d09c101c72d6df1fce5199a05482e3317f7f6e0974922f88282d1ad4c9",
  envelopeHash: "67fca3a7a17784d502e76e2b2c47cefc9da4440aae0dd2858e71a55d3fa33207",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
