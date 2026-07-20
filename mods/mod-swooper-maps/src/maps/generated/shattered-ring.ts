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
  configHash: "867a6a97c361821a077899b0b7401c8db6ad20a64ec88c3d1561e6da8536970e",
  envelopeHash: "21ca9b4699ebc25bcb3fbd99474a40b6f56f02148eeb74e281eabbc4a2f5f82e",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
