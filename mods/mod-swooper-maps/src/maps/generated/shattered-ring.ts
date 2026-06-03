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
  configHash: "c399cc0c23e6cfa50f37785daed8f8ba26be95c4f4f78ed15e4ea0cb22da17cd",
  envelopeHash: "7ac276fc684ad46cfe7be30baaa96efa0f8e9112cfc56e84a254bd2ab0d31d35",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
