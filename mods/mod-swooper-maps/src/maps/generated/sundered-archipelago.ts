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
  configHash: "23c0bae0c905afd12de464844d88d57e5f47d47f0a983464ad480a30d5e76063",
  envelopeHash: "3e6b44d1c7d9f4038577e9ada576cfd6f9824896c004d6f8ba84ed88f53ad44a",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
