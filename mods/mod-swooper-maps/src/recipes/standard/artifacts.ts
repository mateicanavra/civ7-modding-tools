import {
  buildCompleteSchemaDefaults,
  deriveRecipeConfigSchema,
} from "@swooper/mapgen-core/authoring";
import { STANDARD_STAGES, type StandardRecipeConfig } from "./recipe.js";

/**
 * Recipe and stage source feeds both generated Studio artifacts and runtime
 * admission so neither boundary can retain an older generated schema.
 */
export const STANDARD_RECIPE_CONFIG_SCHEMA = deriveRecipeConfigSchema(STANDARD_STAGES);

export function buildStandardRecipeDefaultConfig(): StandardRecipeConfig {
  return buildCompleteSchemaDefaults(STANDARD_RECIPE_CONFIG_SCHEMA) as StandardRecipeConfig;
}

export function deriveStandardRecipeArtifacts() {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  return {
    schema,
    defaults: buildCompleteSchemaDefaults(schema) as StandardRecipeConfig,
  } as const;
}
