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
  configHash: "10297444373d48ac7b1bbe0fbd51548794aa162aa759b3a44c0227b585d26040",
  envelopeHash: "60d0cb1be3c78fe21c50c201bdf3628f49de768cd022f2afdccfe87db81bb8fc",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
