/**
 * Generated from ../configs/sundered-archipelago.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../configs/canonical.js";
import mapConfig from "../configs/sundered-archipelago.config.json";

export default createMap({
  id: mapConfig.id,
  name: mapConfig.name,
  description: mapConfig.description,
  recipe: standardRecipe,
  sourceConfigId: "sundered-archipelago",
  configHash: "982c97b363c25258bec63dc5b8cd2ee79d8f6bbb638098368e38558760ac6892",
  envelopeHash: "ac7a7f480f094d5969e96a52f3187e86760d59424a7a14dfc089a67382b2b10e",
  config: canonicalRecipeConfig<StandardRecipeConfig>(mapConfig),
});
