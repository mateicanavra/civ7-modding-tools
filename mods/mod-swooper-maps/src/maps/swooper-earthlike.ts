/**
 * Swooper Earthlike — Realistic, plate-driven Earth analogue (TypeScript)
 *
 * Goals:
 * - Ocean-dominant world (~70% water)
 * - Few large continents with a mix of active (Pacific-like) and passive (Atlantic-like) margins
 * - Earth-like latitude rainfall bands, with subtropical deserts and wet tropics
 * - Moderate coastal moisture spread and low-frequency rainfall noise
 */

/// <reference types="@civ7/types" />

import { createMap } from "@swooper/mapgen-core/authoring/maps";
import type { StandardRecipeConfig } from "../recipes/standard/recipe.js";
import standardRecipe from "../recipes/standard/recipe.js";
import swooperEarthlikeConfigRaw from "./configs/swooper-earthlike.config.json";

function stripSchemaMetadataRoot(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  const { $schema: _schema, $id: _id, $comment: _comment, ...rest } = record;
  return rest;
}

export default createMap({
  id: "swooper-earthlike",
  name: "Swooper Earthlike",
  recipe: standardRecipe,
  config: stripSchemaMetadataRoot(swooperEarthlikeConfigRaw) as StandardRecipeConfig,
});
