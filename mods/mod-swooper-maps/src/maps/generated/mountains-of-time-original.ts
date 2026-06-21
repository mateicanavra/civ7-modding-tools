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
  configHash: "7def912d1a24b75b4195fe5d66e188a5515f61950443177e96387fe7238b46eb",
  envelopeHash: "3ff44a4e3db990cc50d1f030618bf1417c5d9f68b91b381e456120d290d8adc2",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
