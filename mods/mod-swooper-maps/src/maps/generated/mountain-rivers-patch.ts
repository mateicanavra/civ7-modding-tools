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
  configHash: "825c2ca45c9995aad70bc3dfc00a2a91128d6de9a1b231ab76d385936ea6f705",
  envelopeHash: "7d4d059ba45b1462b6bbe5bd16cb9dbdffef3fc2f8e78193dfcca51ae67f0cfe",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
