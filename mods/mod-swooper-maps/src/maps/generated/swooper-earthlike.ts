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
  configHash: "81d6e6d3c678a640c94d7f74be18397409e4a3395cf1565d28904f8205992db7",
  envelopeHash: "fcc783fe94c57a683fea03ecbcbb41f560eb28b949369461176f4cb25fffc574",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
