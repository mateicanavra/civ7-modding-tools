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
  configHash: "ddb080fc9d4254f425f5d4008433f9d5fd1533fd53a4a759891a75e5be2a348b",
  envelopeHash: "c238eba9f27137ec2a826413f93c25c1121931f1f0ed2a48a9d9c6ac4f3ca1c6",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
