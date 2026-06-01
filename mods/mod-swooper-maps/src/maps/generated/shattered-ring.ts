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
  configHash: "54424042b46853d948f6a7672dccec5f425b06303dde09acc20aa5b749344ccd",
  envelopeHash: "c0d2ea0b0b63bf150f44c300dc24408215155147be656fb6df3e5d3cbc60758b",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
