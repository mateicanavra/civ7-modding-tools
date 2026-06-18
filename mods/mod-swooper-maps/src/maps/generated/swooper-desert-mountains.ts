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
  configHash: "ca69e8985db4f9696dc29661f042a7d4cc43296fe0e0b0ec75dd67720834cd87",
  envelopeHash: "f2f13c70eeb457ac71da565ec9fc95ff5cdb41eff5a8b92b5e60dc4d0fa0ab57",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
