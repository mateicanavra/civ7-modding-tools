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
  configHash: "cce106f22fc01fd2fa2e245945ddfebc12635a30b420ce8b9251fb65779ba930",
  envelopeHash: "36e91c1df6e5796a75c5434b6e8c1467e1a1010f3700f09679eee790f3c19c03",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
