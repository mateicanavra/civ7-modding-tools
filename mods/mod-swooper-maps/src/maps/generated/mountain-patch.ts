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
  configHash: "19d22cb8d6d1f7772a36ca6ea14197808487fefc68e99fcf914b51cfed1be78c",
  envelopeHash: "4fc5ed22aa0d84b519ce44e0b60068fc38ccd3008c639d094df5ea0a8a054568",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
