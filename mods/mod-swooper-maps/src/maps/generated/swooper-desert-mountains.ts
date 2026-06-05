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
  configHash: "d4ef882283ec7a944991dc64f63452c7b00e8b9ed736e8cb7d4c50a0a5f69070",
  envelopeHash: "69d7d30ab6e6c669893c23af20e787e35d2bcb425f8e264a10959406bd8d1210",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
