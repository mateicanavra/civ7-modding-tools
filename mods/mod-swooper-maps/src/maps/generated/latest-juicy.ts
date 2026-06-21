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
  configHash: "ac28fb93c92fac629b4458fe7cb5acf8b38826420d8e0a9cc5ea2df2406162eb",
  envelopeHash: "8b86651a25e5c9b07a2240db76d52f265b5901ac58213a032d97dab162323b16",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
