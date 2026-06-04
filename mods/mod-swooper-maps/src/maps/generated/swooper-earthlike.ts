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
  configHash: "1b0e7d6cf35af348b2f9e84863cec45ef91c592a9dd4d36450bcf2c4e48005e2",
  envelopeHash: "2a339a0e13f28249b6575c9584e76e239ebedaca83f170e1c6ad4b5629907323",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
