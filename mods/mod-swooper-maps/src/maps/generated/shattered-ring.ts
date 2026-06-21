/**
 * Generated from ../configs/shattered-ring.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/shattered-ring.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "shattered-ring",
  configHash: "b30ac2ff4fa169d1db670e0e07b10dd2bb43dc4163fda5a8a71106d23bc759e8",
  envelopeHash: "5eba819a01cc45087bb1e6d917db445fbbe9010d494efef419b3bfa9ed2de19b",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
