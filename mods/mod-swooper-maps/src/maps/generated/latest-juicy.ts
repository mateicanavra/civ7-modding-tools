/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/latest-juicy.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "f6f91195a50ceb503c5cad164c4138d6738b2e63bcb64fbb3deaa58adb70c521",
  envelopeHash: "875c53cc6803d4b037971f5b53576fe576dbb36364db7459425138ee74f921c8",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
