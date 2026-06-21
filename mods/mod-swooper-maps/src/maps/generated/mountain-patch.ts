/**
 * Generated from ../configs/mountain-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-patch",
  configHash: "a4dc50e0364293323ba7db333e9acb5233b0158a35bfa294c5b1cf92e9736d11",
  envelopeHash: "dc0917dc86b9d98e5387b3ec0a7c0969ca2e4c8e8e8026894fb2e01010c3ddc6",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
