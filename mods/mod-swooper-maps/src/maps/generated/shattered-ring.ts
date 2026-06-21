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
  configHash: "6e2fc6358d513ffab2b5c7b1f74774ce2124821b8309cd0442f123851accaa8c",
  envelopeHash: "5bded2cb5cb92fb1de0ec9a76c71b8915e537be9d54304fcf7ee01daa7d524f5",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
