/**
 * Generated from ../configs/sundered-archipelago.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/sundered-archipelago.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "sundered-archipelago",
  configHash: "00f99a7be0608167aba56c1a8bd7076bc955fc54f093848520c8cd639fb711aa",
  envelopeHash: "644fde48a5541d5b3aa409658a43f1d33efef33fc00c5fe351645bb964199c41",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
