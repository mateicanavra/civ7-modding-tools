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
  configHash: "a8d0b49e8fbdc001fa8ee4ac3cb8c86c2c135baa5275a8607b8bd0db9ae77231",
  envelopeHash: "6e9c1769ae5e5a3bf503dbf3c747665e93e01f4aa916e06fefa792d4b2bce989",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
