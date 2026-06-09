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
  configHash: "db800ee36637063b11575f274dd6a3efad9eaa17b9970a70105a0f9807a2a839",
  envelopeHash: "edbae488d3a7b086ea64e8eb241acadf75bb68bf923917277d92474f3eedf510",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
