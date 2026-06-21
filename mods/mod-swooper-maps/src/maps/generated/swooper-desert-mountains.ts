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
  configHash: "264025767c2cfaff8bacdb744c7d87376cce0116fea27590eb0cd39412e9802a",
  envelopeHash: "b69b239d27f95d1d489c832a9d83305b70f76a14203a54ab3e55bd24cb2d30aa",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
