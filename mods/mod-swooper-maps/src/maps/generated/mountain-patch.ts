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
  configHash: "3059106ece0e04230ababd4496f3fc5f034b9e0722c2d7d47a777d317eea4651",
  envelopeHash: "326570aa61db75b1371af70a858fefe100f327705b971a369f28c91a9fe9e4fa",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
