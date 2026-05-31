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
  configHash: "fee24f8b3174270ad83231c0036f6712a6234c71d4f2a2f08aff30f04383fd58",
  envelopeHash: "db14524d84e21af7ec04dab85d3602793a48bc2b68b49a1d165a8e947726e849",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
