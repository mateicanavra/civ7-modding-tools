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
  configHash: "02da2fe382682b7ead4d5991dc20ec930feee109399d751cafad3c08cedae342",
  envelopeHash: "aab601a736710c6fd4a0d7f498e0ed062829a4846efa02ccd05705bfd5e6610a",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
