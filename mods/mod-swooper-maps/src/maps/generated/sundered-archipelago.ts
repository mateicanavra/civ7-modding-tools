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
  configHash: "ec86d9ee5ba387319ae55d3388809396caa8050849b41ea5bb1bb80bb6e4e7b5",
  envelopeHash: "88e083cf335b6acad8181a0cb681bd2ecff3ee070c5b0c4fcb38d7a2e484cc03",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
