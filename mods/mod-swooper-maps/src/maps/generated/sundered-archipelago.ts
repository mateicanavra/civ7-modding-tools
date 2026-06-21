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
  configHash: "228d4190db58dd9db273eebfc49129d32710bad063dd2bbae7e6bb75f1593724",
  envelopeHash: "4f2f363e8fadfee39ff5e3550c7776fd34f6708617289c2ce093ab109007e1de",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
