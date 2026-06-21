/**
 * Generated from ../configs/mountains-of-time-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-earthlike",
  configHash: "e8523bb4ed82258e8c1ffb84f68fd82e60ede7f7dcc91e80f27d722f2b5d6507",
  envelopeHash: "7f765a42dafc4a51d58732cf47c7f002d1a73cb0f474918349ee1c5f0821aaa6",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
