/**
 * Generated from ../configs/sundered-archipelago.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/sundered-archipelago.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "sundered-archipelago",
  configHash: "ce169b35a02eeb2455cfb6ac02755ab983c1304ce75b89c77c1f8eb9d8f7aec8",
  envelopeHash: "cdf6cd3b74bb63404759f14e53acacc01976627dac96525a0ca3e0f47ed8b253",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
