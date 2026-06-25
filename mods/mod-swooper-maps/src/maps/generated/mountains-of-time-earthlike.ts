/**
 * Generated from ../configs/mountains-of-time-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-earthlike",
  configHash: "9fc7649137c45093f41c5865a1627ed060e93d64267c26de627ccfe742d3111d",
  envelopeHash: "83f74b84a0a74b55ce7f15033785c00b4f96540e81ea77bec4602433ddabf8c8",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
