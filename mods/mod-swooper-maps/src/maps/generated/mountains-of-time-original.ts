/**
 * Generated from ../configs/mountains-of-time-original.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-original.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-original",
  configHash: "119012f8cd5f8b65f0a63355d12b0b99a7effe7578ac140369261488a5c6b107",
  envelopeHash: "a5c158a07738e494c9b3b65e811606c179156496ca8b4f804c43b16177fb31f2",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
