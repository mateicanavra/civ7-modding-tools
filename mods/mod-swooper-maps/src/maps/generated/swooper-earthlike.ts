/**
 * Generated from ../configs/swooper-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/swooper-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "swooper-earthlike",
  configHash: "a797a6dbbcb62e166b4c2abe1b3619461a56c90c18b634381805560dca77d864",
  envelopeHash: "61878420d262ce4bafa33aeb5698d8bec5a3bfd35e34788dfff4c1bbab56e83a",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
