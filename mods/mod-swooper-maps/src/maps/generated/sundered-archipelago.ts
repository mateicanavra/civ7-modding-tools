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
  configHash: "32ff35bf91d97313b37a879c03514ee22559dad3d49edada5f7fbd5119c51657",
  envelopeHash: "1a460e338af17b4ae57caf7a75816a3a84abf06163fad379dbc45f6fa02ad809",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
