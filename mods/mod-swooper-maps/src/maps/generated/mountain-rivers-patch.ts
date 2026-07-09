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
  configHash: "4234ee87d785472b1ebcab53a34ba13bbe4a58626a9b45047f0aadf9d4dd809b",
  envelopeHash: "162c04dd984f0a33af31185b03530420758f4f0a08f99fa38556cbd20d325556",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
