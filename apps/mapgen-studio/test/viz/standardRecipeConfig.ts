import { canonicalRecipeConfig } from "mod-swooper-maps/maps/configs/canonical";
import type { StandardRecipeConfig } from "mod-swooper-maps/recipes/standard";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "mod-swooper-maps/recipes/standard-artifacts";
import { Value } from "typebox/value";

function isStudioStandardRecipeConfig(value: unknown): value is StandardRecipeConfig {
  return Value.Check(STANDARD_RECIPE_CONFIG_SCHEMA, value);
}

/** Admits a canonical envelope through the exact generated Studio recipe contract. */
export function studioStandardRecipeConfig(value: unknown): StandardRecipeConfig {
  const config = canonicalRecipeConfig(value);
  if (!isStudioStandardRecipeConfig(config)) {
    throw new Error(
      "Canonical Standard config does not match the generated Studio recipe contract"
    );
  }
  return config;
}
