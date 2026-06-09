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
  configHash: "e9248e0e4979b1e0e73afb0f8fa46f7ecc262182531419ac7e172483d4d29967",
  envelopeHash: "a507c3cf46e4506670208403b00066cf9405a6868801610c24ed8bbd52f8f974",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
