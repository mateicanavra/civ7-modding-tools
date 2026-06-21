/**
 * Generated from ../configs/mountains-of-time-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-earthlike",
  configHash: "d6c83141bd372e959caff6d9b2921759adedf9a397eea927ab9b93fc98cb0893",
  envelopeHash: "0f23cf46fd615ef1ac44ccd7426d63a5623cb6fa34fd53992f98a027e7aa994a",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
