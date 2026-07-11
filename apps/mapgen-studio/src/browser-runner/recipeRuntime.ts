import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { RecipeModule } from "@swooper/mapgen-core/authoring";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import standardRecipe from "mod-swooper-maps/recipes/standard";
import {
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
} from "mod-swooper-maps/recipes/standard-artifacts";
import type { XSchema } from "typebox/schema";

export type StudioRecipeId = string;

export type RecipeRuntimeModule = Pick<
  RecipeModule<ExtendedMapContext, PipelineConfig, unknown>,
  "compile" | "runAsync"
>;

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
    recipe: RecipeModule<ExtendedMapContext, TConfig, unknown>;
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
      compile: (env, config) => input.recipe.compile(env, config as TConfig),
      runAsync: (context, env, config, options) =>
        input.recipe.runAsync(context, env, config as TConfig, options),
    },
  };
}

function makeRecipeId(namespace: string, recipeId: string): StudioRecipeId {
  return `${namespace}/${recipeId}`;
}

const RUNTIME_RECIPES: readonly RuntimeRecipeEntry[] = [
  defineRuntimeRecipeEntry({
    id: makeRecipeId("mod-swooper-maps", "standard"),
    label: "Swooper Maps / Standard",
    recipe: standardRecipe,
    defaultConfig: swooperStandardDefaultConfig,
    configSchema: swooperStandardConfigSchema,
  }),
] as const;

export function getRuntimeRecipe(recipeId: StudioRecipeId): RuntimeRecipeEntry {
  const entry = RUNTIME_RECIPES.find((r) => r.id === recipeId);
  if (!entry) throw new Error(`Unknown recipeId: ${recipeId}`);
  return entry;
}
