/**
 * Generated from ../configs/studio-current.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/studio-current.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "studio-current",
  configHash: "f5bf5787f7c0670d0ecf4fee6d1cccdaaea2922b8a1951e47e094ed10b21773b",
  envelopeHash: "b5def7ee5bc4f807da93038429cc7052d461f7f7ecae173131c8e1f86750e3b0",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
