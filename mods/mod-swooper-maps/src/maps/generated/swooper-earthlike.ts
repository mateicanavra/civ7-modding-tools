/**
 * Generated from ../configs/swooper-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/swooper-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "swooper-earthlike",
  configHash: "eaa8a91bb49ee1c5e226b20b119e409b6a04f15393fb44dde391300ed8455f15",
  envelopeHash: "a0b984a5737ec3cd8e7f17cbb80b34eb2901fec014dd2f82e5b768e72a7fcb88",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
