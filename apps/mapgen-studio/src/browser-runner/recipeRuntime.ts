import type { RecipeModule } from "@swooper/mapgen-core/authoring";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import standardRecipe from "mod-swooper-maps/recipes/standard";
import {
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
} from "mod-swooper-maps/recipes/standard-artifacts";
import type { XSchema } from "typebox/schema";

/** Stable recipe identity accepted by the Studio browser worker. */
export type StudioRecipeId = string;

/** Small executable recipe surface required by the browser worker. */
export type RecipeRuntimeModule = Pick<
  RecipeModule<PipelineConfig, unknown>,
  "compile" | "executeAsync"
>;

/** Registered browser-worker recipe with its canonical authoring schema and defaults. */
export type RuntimeRecipeEntry = Readonly<{
  id: StudioRecipeId;
  label: string;
  recipe: RecipeRuntimeModule;
  defaultConfig: PipelineConfig;
  configSchema: XSchema;
}>;

function defineRuntimeRecipeEntry<TConfig extends PipelineConfig>(
  input: Readonly<{
    id: StudioRecipeId;
    label: string;
    recipe: RecipeModule<TConfig, unknown>;
    defaultConfig: TConfig;
    configSchema: XSchema;
  }>
): RuntimeRecipeEntry {
  return {
    id: input.id,
    label: input.label,
    defaultConfig: input.defaultConfig,
    configSchema: input.configSchema,
    recipe: {
      compile: (setup, config) => input.recipe.compile(setup, config as TConfig),
      executeAsync: (context, plan, options) => input.recipe.executeAsync(context, plan, options),
    },
  };
}

const RUNTIME_RECIPES: readonly RuntimeRecipeEntry[] = [
  defineRuntimeRecipeEntry({
    id: "standard",
    label: "Swooper Maps / Standard",
    recipe: standardRecipe,
    defaultConfig: swooperStandardDefaultConfig,
    configSchema: swooperStandardConfigSchema,
  }),
] as const;

/** Resolves the executable browser-worker recipe registered for a Studio recipe identity. */
export function getRuntimeRecipe(recipeId: StudioRecipeId): RuntimeRecipeEntry {
  const entry = RUNTIME_RECIPES.find((r) => r.id === recipeId);
  if (!entry) throw new Error(`Unknown recipeId: ${recipeId}`);
  return entry;
}
