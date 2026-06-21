/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/latest-juicy.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "e434032d4a88d6fb98f6ec3d484e3d57bdf2ac70af14f825d95903b5d5dbac3b",
  envelopeHash: "95f6c2a53e2ea1b393e104b9bdf52a402f37527c3dd89cc698dc5964c2f2d821",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
