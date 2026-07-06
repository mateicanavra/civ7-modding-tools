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
  configHash: "a74f751ec1780019dc428cf6f89e47c47c72714dd1f7a9bc9ae5d03b511785ef",
  envelopeHash: "bd2dd65adc39dd83f070d6395dbd959a70fd0243b92a52ff2b0ad29320c431b9",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
