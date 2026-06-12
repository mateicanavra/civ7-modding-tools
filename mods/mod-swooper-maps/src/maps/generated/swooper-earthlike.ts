/**
 * Generated from ../configs/swooper-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/swooper-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "swooper-earthlike",
  configHash: "0ee1f4b5f7c1867acc40f535a08721e2637027a3322d68e76da4a330d2e59b20",
  envelopeHash: "561f0c5b8636bf96b5ab75c1efb07a53bfeed7cbac3ffeaac75722a737949458",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
