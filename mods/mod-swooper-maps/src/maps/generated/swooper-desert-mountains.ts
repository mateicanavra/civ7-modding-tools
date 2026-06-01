/**
 * Generated from ../configs/swooper-desert-mountains.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/swooper-desert-mountains.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  latitudeBounds: {
    "topLatitude": 40,
    "bottomLatitude": -40
  },
  sourceConfigId: "swooper-desert-mountains",
  configHash: "7471dd3fda1c302b35bdce1bbec201f6a08bef36a6911ac3c0a252c0ab2b3bb9",
  envelopeHash: "a1173f4e44b253dcb035822159cbe1a2cab2d7a856627b600b1c68ff193859e7",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
