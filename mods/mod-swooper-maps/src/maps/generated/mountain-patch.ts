/**
 * Generated from ../configs/mountain-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-patch",
  configHash: "4234ee87d785472b1ebcab53a34ba13bbe4a58626a9b45047f0aadf9d4dd809b",
  envelopeHash: "7f6e1c42d8edc16a1b5e729d9c2a73106a1ffaaa976eb0fcad25e6378f2feea6",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
