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
  configHash: "1fc12b546705f96d39a4ae07dae201624a689477fe248efea245dac3cd0c0ee0",
  envelopeHash: "48c2f2866a5280713c799c65c3c6fa0a562e6bb68831a2a14dc689643c126bc5",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
