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
  configHash: "6f073f72603c48636a00db139e2182962e06b1d396d8f7ecd3b28e11c2fb309c",
  envelopeHash: "590c137691b2ebb3afdb7d86387762cb6fbfe4f7daf5b192f7227b21e079dc8d",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
