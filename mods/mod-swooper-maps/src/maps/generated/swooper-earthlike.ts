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
  configHash: "4f015d12e781620b5b93e3078f124d6fee78dab13569d726e2e7f400bb9c787d",
  envelopeHash: "e091db934ba4c3a41386fe52ba1accbed378c219c0b05d80455acdfa988f7655",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
