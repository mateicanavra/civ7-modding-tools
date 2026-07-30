import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { Value } from "typebox/value";
import { STANDARD_STAGES, type StandardRecipeConfig } from "./recipe.js";

/**
 * Recipe and stage source feeds both generated Studio artifacts and runtime
 * admission so neither boundary can retain an older generated schema.
 */
export const STANDARD_RECIPE_CONFIG_SCHEMA = deriveRecipeConfigSchema(STANDARD_STAGES);

/**
 * Creates the schema-authored baseline for every Standard stage and step.
 * Callers receive a fresh value already asserted against the same schema used
 * by runtime admission and Studio generation.
 */
export function buildStandardRecipeDefaultConfig(): StandardRecipeConfig {
  const defaults = Value.Create(STANDARD_RECIPE_CONFIG_SCHEMA);
  Value.Assert(STANDARD_RECIPE_CONFIG_SCHEMA, defaults);
  return defaults as StandardRecipeConfig;
}

/**
 * Returns the live Standard recipe schema paired with a freshly derived
 * default config so generators derive both artifacts from the same runtime authority.
 */
export function deriveStandardRecipeArtifacts() {
  return {
    schema: STANDARD_RECIPE_CONFIG_SCHEMA,
    defaults: buildStandardRecipeDefaultConfig(),
  } as const;
}
