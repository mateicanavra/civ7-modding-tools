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
  configHash: "289d0dca6a8a9dab548009f9c8132f1b14002bb8d1d877b5e25314c9d41469bb",
  envelopeHash: "92b32cb674f9b021cab0e7d62a12d3c9e6dbe1b7dd2c1bcdca9781b2031dcb45",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
