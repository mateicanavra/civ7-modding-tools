/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/latest-juicy.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "00a564f8d26272842634cfb9ba1a77c477075c35ad6631818b9cfd1c566be2ab",
  envelopeHash: "5d6a91c2ea3366dba4186581d941b1877c0dfe1ce14786e8f94dc28621b639f7",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
