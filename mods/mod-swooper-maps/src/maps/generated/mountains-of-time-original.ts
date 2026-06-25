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
  configHash: "8e02b429611b7290d31677b73bf0d3e0a64266b2c5bac64b5f35b4a231fb25ed",
  envelopeHash: "9da5eacc45ab0cb70eb0327e75cb701ea494805057bc70211e2fa11b2c87f81e",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
