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
  configHash: "db800ee36637063b11575f274dd6a3efad9eaa17b9970a70105a0f9807a2a839",
  envelopeHash: "624aa6a0f9d1042621f8fc30d4baba1093f609280bc5f777177255a613bab753",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
