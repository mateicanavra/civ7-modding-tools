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
  configHash: "9d3757a239617d3e1aab0ae7fd90000e36f6950b0fb02a62d2a6e04084f28bf7",
  envelopeHash: "5c5abf2332a306cca8d9c344f7d4a969164b763652f50b89e1d26a6e696a0e21",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
