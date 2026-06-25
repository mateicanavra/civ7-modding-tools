/**
 * Generated from ../configs/sundered-archipelago.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/sundered-archipelago.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "sundered-archipelago",
  configHash: "ead9419ac4618a941c8a9907075c49e7b648c1b65eea228258020e6c309341d8",
  envelopeHash: "894e8992774a55c58aef2b6b3dd39c6bd20fd1b8dc4c42953926bde3425ec701",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
