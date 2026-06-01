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
  configHash: "7e3b100b867fc1f07b549d1373a60ebca61645cac0ea762becfcb1dd691c0381",
  envelopeHash: "1c0bfa88c7fe8e3dc917e7eb84986d399a1c72022423add91646f2eb51caf2f5",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
