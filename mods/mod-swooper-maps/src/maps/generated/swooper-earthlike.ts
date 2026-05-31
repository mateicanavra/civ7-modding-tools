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
  configHash: "dc2352604837b0c70e04e08b4d4a721e3274c36eb1dc138fe92b99364c57234d",
  envelopeHash: "6aef7b8f29de725bf9415c1e86772a99e401b979ed50b694b33ea47ba375c792",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
