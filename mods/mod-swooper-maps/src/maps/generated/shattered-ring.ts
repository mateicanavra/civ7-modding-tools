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
  configHash: "a96c0a44716aefe7d6c08eb532bf0b1ca0d2a0d0620a94906a9caceb51a9dc71",
  envelopeHash: "944a98fb9e5368aac2a687c4db65f6dec384114a7040f8c3bc0d3386c1e7b868",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
