/**
 * Generated from ../configs/mountain-patch.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountain-patch.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountain-patch",
  configHash: "b2a0e1fee3e215376a6cb1feae27c57849c8498f3038740b3a3f958ea9fc5cfe",
  envelopeHash: "010416b1ad7d0532b3ad9bce3749691c4211de213ca68d0f96e4c6bc08195ef7",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
