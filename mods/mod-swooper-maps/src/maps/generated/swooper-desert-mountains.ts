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
  configHash: "3feea9a7c509b30a3f42aeb5059220e1f72f9722dfb05564f67c7b93c1a9004a",
  envelopeHash: "13f59e23112a19ac1a36f319065667ecdc3f503a0521d47fd7314465dabf89b2",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
