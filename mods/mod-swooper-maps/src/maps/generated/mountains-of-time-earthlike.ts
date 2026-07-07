/**
 * Generated from ../configs/mountains-of-time-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-earthlike",
  configHash: "a739af0134678e8a5becad93ca73f723cf282c236612f29449dfca85cd73e902",
  envelopeHash: "f96652cfe8c1734a7bb760067a567ece1a99b66c864f9736a7698bfd6357ae35",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
