/**
 * Generated from ../configs/mountain-rivers-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-rivers-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-rivers-patch",
  configHash: "f9a8b718994f90d3595eb87981834dedece3f3c6ae6efa6c950463a0b03d2146",
  envelopeHash: "ce5a4a421676a97a5ab3379cb8bddf6c2eabb480cff1de1eef16390e3ceffc52",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
