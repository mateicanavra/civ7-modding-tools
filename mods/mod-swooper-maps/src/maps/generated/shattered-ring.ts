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
  configHash: "043eccd235be1d825c11e038b44d4b4fac1fe733f27db747e21c870471690e5a",
  envelopeHash: "a4120411435def2f65f6903a595ee9ad862a4fed513b16df3fc49dd1ef461e3f",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
