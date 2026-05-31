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
  configHash: "78a1868862f1a1c2a175efc1400ff551c88b684c856dfa9c902a3df66263c643",
  envelopeHash: "275ac680190b5fe95c674ff23c8ab03af9b08aafa3d40dbf8a2f88a1bc52dcec",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
