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
  configHash: "3895fd4dd59624274f9b84715de4bc2523ef26857e823d8de3a763435b8e8c54",
  envelopeHash: "72f311d71e18c0abaf518dfbb3479b4925efbbe69c03b0e9f9212367dc81deab",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
