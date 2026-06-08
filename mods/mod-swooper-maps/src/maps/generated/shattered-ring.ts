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
  configHash: "13bccde5af4327583b4d3097fc5c3d9c459cfd2b14636d2f292e52210139d480",
  envelopeHash: "756294e7c212fd602aac673e515350d319e1ebd5ce3a87580d301966c2b2bda8",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
