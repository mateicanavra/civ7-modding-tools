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
  configHash: "3627ae29322b74bcc92e59909592af08ed62fe7676e46877a842ae6e12fc2b23",
  envelopeHash: "a86fec21cde22bc2fa28ca5acad3bb12f43604b4dbec36f2e72d993cbd3f96f9",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
