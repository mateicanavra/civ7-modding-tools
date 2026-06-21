/**
 * Generated from ../configs/shattered-ring.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/shattered-ring.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "shattered-ring",
  configHash: "f875dd2e675862774c01cf9134ceb1c7ffce6388f05f6a0f5b09cc0dd87297cc",
  envelopeHash: "0c018d8ac3785eddf8f18189781c5a47fe7d464fbac5c805f49dbf7b4e4cc645",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
