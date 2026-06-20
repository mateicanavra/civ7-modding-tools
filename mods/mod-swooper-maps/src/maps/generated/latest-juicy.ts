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
  configHash: "f024fc651c704a008be59973884b89abeffd97faef8a272fbca5d2819ec3b1de",
  envelopeHash: "265f5338295e485c5576f23551da0c96f3fb08d6e9e47aa1e376121c3553d9e3",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
