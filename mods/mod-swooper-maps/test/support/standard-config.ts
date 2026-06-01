import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";

/**
 * Keep test defaults aligned with the canonical Earthlike map config so test fixtures
 * do not drift when stage surfaces evolve.
 */
export const standardConfig = structuredClone(
  canonicalRecipeConfig(swooperEarthlikeConfigRaw)
) as StandardRecipeConfig;
