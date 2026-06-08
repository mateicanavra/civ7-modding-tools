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
  configHash: "fe339cbed29d8a1487a0118b3da832df55af2832f2e91c59bad6552207a0f4e0",
  envelopeHash: "19a8b29a6e67a7f0e2914eed9829056f723ec2ff21de076e696994e47b80f901",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
