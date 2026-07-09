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
  configHash: "23489d2b7925236df55f38f671e2c40dd6f331a3ac7c126ee9c77b58342ab959",
  envelopeHash: "ff71e5ed129e4e2473ab21c4ae74e27f28a32cc78239e5088e0f31d30751eddc",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
