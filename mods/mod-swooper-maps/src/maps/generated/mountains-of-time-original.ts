/**
 * Generated from ../configs/mountains-of-time-original.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-original.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-original",
  configHash: "58ca708eb844ec45603fd4c88eeb2bbece4efb7369548e249d81ca8fac3885eb",
  envelopeHash: "a37be143c81dd3afa19b9f8a9b741f4eb45f6c2e51479208dbfefbe12101b8e2",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
