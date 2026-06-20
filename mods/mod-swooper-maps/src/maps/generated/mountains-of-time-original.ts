/**
 * Generated from ../configs/mountains-of-time-original.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-original.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-original",
  configHash: "4e46a3fb8cfd9b693eeff4f920732772e9f6075a514ca80772b668e1b73a7f0b",
  envelopeHash: "fce7e4ff725df5a4b9c23fa4bdcff83147531a0abca26bcc84550b38bd6b79d0",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
