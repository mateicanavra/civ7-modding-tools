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
  configHash: "e6c6bc2cc2185d7e1811a726ba3d77f01d945293d12c2fa21a065501a5d91ca7",
  envelopeHash: "8551b6c3ad34354fa2c6ca8c858b3f47b08dd2cf1095fbeef53385bf8a3b727f",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
