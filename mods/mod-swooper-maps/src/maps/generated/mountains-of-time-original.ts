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
  configHash: "f7c1f26b28c137f19926f484fea6dfb7cf4e658007f494ce32527d9d54ceed5c",
  envelopeHash: "5b9344260edb906c560c943296315ec2d9eaa17dcf6a1961543b3495c22a05cf",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
