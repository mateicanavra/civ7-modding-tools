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
  configHash: "925debd957d04a47fc386e9bf2f8843326db9bbda900064d6b20497f6ff8252c",
  envelopeHash: "8a9b9439921b0eb285b360a3a2b6580d4f08ec68d829de91b3c87b907999a55f",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
