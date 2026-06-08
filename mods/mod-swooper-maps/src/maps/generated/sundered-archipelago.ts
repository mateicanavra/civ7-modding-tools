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
  configHash: "6bda4a99a0624382155adbcabea3de281050c6d51457aeb9cf8b9cbb5b26adaa",
  envelopeHash: "f67cab68fcfa9437251b49b63bc39e70ff7f2c0ce3f4339e7ea77d43c7ce547f",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
