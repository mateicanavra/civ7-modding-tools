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
  configHash: "e832953c22d23fa4ff78d8ee44541685397792ce7e8857ee81542ec5d26d9a13",
  envelopeHash: "550584f67daa289653c5a40689ef014fb94afb53331c8464fb48cb3b144b6394",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
