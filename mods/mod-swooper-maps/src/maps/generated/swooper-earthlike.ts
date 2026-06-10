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
  configHash: "d7b23661616038b79212a33ce01e00099a29b3d87f438627ddf7624200d9b9ae",
  envelopeHash: "aa5a42aed0d0dba34be315fdd15e940689678c37e2cb8b1e76e204c98d032176",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
