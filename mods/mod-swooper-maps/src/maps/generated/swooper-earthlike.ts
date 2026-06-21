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
  configHash: "801e0acad62ccd845842e34b331ae1f50d9010381f95f8f18dd4cf72ed1b02aa",
  envelopeHash: "ab2f1f42fac13ca9c515a5ece87a0f62d65fb20d11d8690e5a639973d8e37463",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
