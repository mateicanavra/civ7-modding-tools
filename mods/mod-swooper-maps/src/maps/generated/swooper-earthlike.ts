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
  configHash: "26e2adac284ab1ab1e1c1e12a5b0067ad4a2f7c73399b7c82548b3290be9cf47",
  envelopeHash: "5d4aa061d8d0b77251c85c9af1f91a79eea5f50cea015485abb8af18bbe25c85",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
