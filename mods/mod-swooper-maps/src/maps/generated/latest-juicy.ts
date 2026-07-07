/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/latest-juicy.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "bbc0fb512e2c9bef7c95642958eb8138ad2e33e26c4d2e5cefec8757b595e9cf",
  envelopeHash: "71ac42dfb877f729aba39b205ebfea9ba59db4992621e251b84f057fd1ebe9f2",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
