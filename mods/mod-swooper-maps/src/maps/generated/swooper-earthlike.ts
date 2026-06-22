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
  configHash: "f416b9d9ae048660e3ef681129c99a6fb8b59ec863e4c06272089813864a9327",
  envelopeHash: "a3acab47de01a419ba5bf1d2585aa7181689196f4b367892b4de88fbb8b227c5",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
