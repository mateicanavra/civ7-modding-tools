import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";

import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";

/**
 * Keep test defaults aligned with the canonical Earthlike map config so test fixtures
 * do not drift when stage surfaces evolve.
 */
export const standardConfig = stripSchemaMetadataRoot(
  structuredClone(swooperEarthlikeConfigRaw)
) as StandardRecipeConfig;
