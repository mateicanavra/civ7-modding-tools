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
  configHash: "3d53f6de153db8bafc0d3c12a56efbdf45a57f1911f8880a74271081ed873d88",
  envelopeHash: "402675c4c3cbaa8ab5d27f4e1c622fb252bc3e5990ccd4f789af565498fd138a",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
