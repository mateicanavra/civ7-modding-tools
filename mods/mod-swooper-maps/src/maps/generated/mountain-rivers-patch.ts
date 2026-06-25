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
  configHash: "a4dc50e0364293323ba7db333e9acb5233b0158a35bfa294c5b1cf92e9736d11",
  envelopeHash: "22b2e6b5b4b77e46c66308318a5ff6e1e554973c20470bbf732529b66fcece7c",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
