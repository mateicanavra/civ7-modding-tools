/**
 * Generated from ../configs/mountains-of-time-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-earthlike",
  configHash: "eb0ca822819a90566e1a3284c1c681e8760e715bf1ee82bf35da2aaf54f566f9",
  envelopeHash: "93b74f8e0d00795f1d98bdab397601c5733e415d721affe1b9d3ac2ee65678d8",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
