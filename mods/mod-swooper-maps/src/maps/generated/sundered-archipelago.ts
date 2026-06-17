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
  configHash: "089937b5a852b58dea8e69b2341affd6c687c349aeafa33c9aa601b162323115",
  envelopeHash: "72c9c33110358312c814ca5d67ec64d5cc25c9851fe8b76b69ce16850b539178",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
