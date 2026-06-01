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
  configHash: "6acd51c292ffebd99a6e6a17470356a2dac1e18f2208d1dec62c7e6c50b17b28",
  envelopeHash: "43edbd6b885e986c58e03b41d26386ada34e3192578b17bcf696358474064cc7",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
