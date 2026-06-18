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
  configHash: "ce5e87eb3b1b15e6c8c8fc8c6697b5f3c9be5edf283790e3d37bdc6a6ba44033",
  envelopeHash: "8097aa7214472cdfbc481c6e45972752855ac247fee4e790c667cf18b150ca0e",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
