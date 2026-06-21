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
  configHash: "070a7a8fcf35a6a7c42e9f1ead8051694e332dbdadb1e6d4cbdb3881b76f7ed5",
  envelopeHash: "2ada765aaa7352461dac754c109dd23aa860f4ebb6ce493e54be60f2b5262541",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
