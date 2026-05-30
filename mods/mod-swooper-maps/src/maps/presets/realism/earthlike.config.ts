import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";
import type { StandardRecipeConfig } from "../../../recipes/standard/recipe.js";
import swooperEarthlikeConfigRaw from "../../configs/swooper-earthlike.config.json";

/**
 * Preset: realism/earthlike
 *
 * Intended posture:
 * - Same authored posture as the shipped Swooper Earthlike map config.
 * - Kept as a TypeScript import path for tests and legacy callers, not as a
 *   second tuning source.
 */
export const realismEarthlikeConfig = stripSchemaMetadataRoot(
  swooperEarthlikeConfigRaw
) as StandardRecipeConfig;
