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
  configHash: "3aed01df63f572a94f7cc7e438ef6bebf90d49f7fcc7ddd65fc8ac68d38ce602",
  envelopeHash: "fdcbed52adf7367ac43f93f8fb7704a8a6af0bdb5ff15dcf53e644138eccddb4",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
