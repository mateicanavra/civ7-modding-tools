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
  configHash: "9082fb6cfefe999852b74a5588914407aa0d0cf6df96792ba9686b1fb428e4e6",
  envelopeHash: "4597fd28869c4f64c1c812ba090344f5c6c41f596cc1fc1a4253d7f8cda5476c",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
