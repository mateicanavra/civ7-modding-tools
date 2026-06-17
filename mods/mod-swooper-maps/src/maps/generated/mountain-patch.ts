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
  configHash: "e4c2fb8cf1740ed089d40e9e6d0c045e8bcb7f693302d83c71ecceb688c503da",
  envelopeHash: "b89963ba3c00796b5b163c4955fbc4999c2a2a22b25112d52e915c050653944e",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
