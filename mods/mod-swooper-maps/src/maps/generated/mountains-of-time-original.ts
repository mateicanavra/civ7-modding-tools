/**
 * Generated from ../configs/mountains-of-time-original.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/mountains-of-time-original.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "mountains-of-time-original",
  configHash: "51c48bff6c8045da98464d13264efababbf5f338f2341d5e9446ca92ab6cfa6d",
  envelopeHash: "6cdba223534ac2ac73df2dd966b9863a81e45fc36eb6b1dedf522c932369189a",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
