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
  configHash: "88704bb04682c6921345a553b9ae2d3fc7be7b9cd25629361361125cccba9ec2",
  envelopeHash: "27df00a6bd5f1e63518ddf5b693218d6a73ccd6c169207339483036ea79f6bb1",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
