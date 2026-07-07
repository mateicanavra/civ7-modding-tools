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
  configHash: "ed5ecc7a8f53e04e754dc4811b70850f4b18e60b04a8fac707a7d183dbcb21e0",
  envelopeHash: "84c22df99b534b6bf2945418bf99b6bd9ba45f05af40f644ba267d3d2985a4b4",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
