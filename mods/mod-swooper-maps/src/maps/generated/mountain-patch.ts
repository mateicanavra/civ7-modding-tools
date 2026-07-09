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
  configHash: "825c2ca45c9995aad70bc3dfc00a2a91128d6de9a1b231ab76d385936ea6f705",
  envelopeHash: "55b9ae86b53b98e702290d7007e55a070f5212a8221ab7b704af3dfa7009c7da",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
