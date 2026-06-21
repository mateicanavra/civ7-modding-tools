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
  configHash: "19d22cb8d6d1f7772a36ca6ea14197808487fefc68e99fcf914b51cfed1be78c",
  envelopeHash: "de245ca18d28fcaef4658a5c210eaa742c489f40ad25f0d34d19764abf8cc82d",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
