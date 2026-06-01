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
  configHash: "945e3a5371c7a4ae84925c5ef611231887f2c9deca7e77501b86b4987a3eb786",
  envelopeHash: "99456543f0fa08847d01eee2a5bc5907177f8a6ac163a8169fee7e0aecb19ec2",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
