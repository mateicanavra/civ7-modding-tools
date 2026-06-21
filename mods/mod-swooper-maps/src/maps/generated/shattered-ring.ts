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
  configHash: "557fa65b83a0e5c6ca95c403544b6cbce007dff90c1c181a5c8e72ef51a86bc3",
  envelopeHash: "f39f93c070b5464e0a0063d6a2482e82a94d9a7b3f11993f9baae05714141b0b",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
