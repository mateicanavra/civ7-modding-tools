/**
 * Generated from ../configs/mountain-rivers-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-rivers-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-rivers-patch",
  configHash: "b2a0e1fee3e215376a6cb1feae27c57849c8498f3038740b3a3f958ea9fc5cfe",
  envelopeHash: "f5b018f10e7956fe19297a1a0e119dff7542add2cb2321d41da9c3d778978e4d",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
