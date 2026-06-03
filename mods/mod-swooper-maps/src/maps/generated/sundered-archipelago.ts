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
  configHash: "c74d44fd2f632bed4a15807ea37dd4f996c79d1340bd756b5db69345bc1f4b5d",
  envelopeHash: "48a775c5e5405f35ba70ded2223b640e807918e6729b55482f583d0b3c7e13d3",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
