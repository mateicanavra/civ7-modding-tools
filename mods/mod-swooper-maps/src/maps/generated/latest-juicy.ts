/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/latest-juicy.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "4f7c750b9cd78f264d2bd83df1acb06f082c7964a56af8a3f62716e11d6ad045",
  envelopeHash: "fa2b76a3ed539f1ed58fde8c22fc789857bac914ae0645e360176e2f36dae46d",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
