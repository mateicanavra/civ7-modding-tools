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
  configHash: "6fa6dab8971ace13a606bd69d6c0ea159af7333bab35d8201f35133754dd94e5",
  envelopeHash: "e1eaa6d01157d3cf25c1006f1a401d2d7800fe32b2c1e9162daf523427466f8c",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
