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
  configHash: "7bb093ce627ec9deae58178e79ed3b17f62dad1024f01fb3a56157cc99afd174",
  envelopeHash: "73243ba25e63bce7d8b2de15d8f2ad028a64b84743c3e8ef367c03d9dc4d2161",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
