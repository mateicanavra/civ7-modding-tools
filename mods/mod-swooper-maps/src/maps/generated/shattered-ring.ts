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
  configHash: "9686460b01e13323ec0be90476dd1e2f537907bf9e73129b8a16c9d7dfa997f0",
  envelopeHash: "ca70b0d399f9b06c89b98a9060540b6a32c877de127bd83c45422ca0489a2ab8",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
