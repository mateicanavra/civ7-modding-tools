/**
 * Generated from ../configs/sundered-archipelago.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/sundered-archipelago.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "sundered-archipelago",
  configHash: "74c81058e8bf099a0043fd05ada649d9a348cf9198b97fd7ac0eea0355799c0f",
  envelopeHash: "9c90b4443e82288cf0310394a58b64fbc0a97188c989ac46bd05c8d4ca4400b4",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
