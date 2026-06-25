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
  configHash: "5cf787d777d45d259a9927ec5868454c3e3ebaa31eeb3c2edc691bfd22593a68",
  envelopeHash: "ef26ec3ee045d86fdb24e0df74833389983c2dfa19b45157db5f51ffa6fffd41",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
