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
  configHash: "3ff84897721485e202967deef2d97763793c7399fe707bbe36b5724eca03cdb1",
  envelopeHash: "0d3ad2a9133e62cf34808eb172e8d2b6c353f68150902a32426ff7b4efa841f7",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
