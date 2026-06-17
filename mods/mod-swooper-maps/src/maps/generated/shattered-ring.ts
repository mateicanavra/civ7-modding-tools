/**
 * Generated from ../configs/shattered-ring.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/shattered-ring.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "shattered-ring",
  configHash: "d57e1baa090c7ffd2c52ed4c915c0e03482d8cabea764755356a7eb075505b1e",
  envelopeHash: "7e6d388295646f6f58d8c2932db0ece36c05e7f47da73879cfca2b3e1d27748d",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
