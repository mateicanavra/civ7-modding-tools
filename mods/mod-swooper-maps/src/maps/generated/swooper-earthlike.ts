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
  configHash: "ceae9601ee0b856483d0874ee3dfdff4a189eb226d01f8ab9dc8b7484475765f",
  envelopeHash: "69278bc0babb7fd147761ab4f997d3ab6a4dfac5c03de7ebccf1118a3d30c20c",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
