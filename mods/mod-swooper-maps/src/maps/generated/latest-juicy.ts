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
  configHash: "899e98ee1719d90f635cbb9bdf6f587c2fb178ddc2e0a701bc02146a51a82b51",
  envelopeHash: "f1be073e9efa248acf20454e03bf55dc6d236c341e343910a25a3c1dbf541728",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
