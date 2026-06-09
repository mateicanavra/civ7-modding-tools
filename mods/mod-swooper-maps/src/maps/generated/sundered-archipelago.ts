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
  configHash: "d6c7ea67917e6ce358427e816b86895b775f1890961075951914376d2329c6a4",
  envelopeHash: "1db428d21de3f1b7d8b59c4e5d8a57c74905491cf56b0d7f5220ce151f41fe92",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
