/**
 * Generated from ../configs/swooper-earthlike.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/swooper-earthlike.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "swooper-earthlike",
  configHash: "db0503cbfe86f98157065ea92077bbfb2f893940dcf67ad2b140b5be63d6996b",
  envelopeHash: "1f0ef1c06fc919174a9dc8ec9f67300fb83318ed035230828003aed013109356",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
