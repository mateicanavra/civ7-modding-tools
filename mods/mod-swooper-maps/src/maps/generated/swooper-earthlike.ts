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
  configHash: "044ac8a3fe00f8b998ab5beb976688e31a893540c3aa1c9c9baddb83268cd076",
  envelopeHash: "53ae3ebbed4dad0164acb10d11b57a47233b49bc2d9bf2bf788517d19134d165",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
