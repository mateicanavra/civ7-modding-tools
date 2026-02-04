import browserTestRecipe from "mod-swooper-maps/recipes/browser-test";
import {
  BROWSER_TEST_RECIPE_CONFIG as swooperBrowserTestDefaultConfig,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA as swooperBrowserTestConfigSchema,
} from "mod-swooper-maps/recipes/browser-test-artifacts";
import standardRecipe from "mod-swooper-maps/recipes/standard";
import {
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
} from "mod-swooper-maps/recipes/standard-artifacts";

export type StudioRecipeId = string;

export type RecipeRuntimeModule = {
  id: string;
  // Keep this boundary loose: runtime recipes are strongly typed internally,
  // but Studio's engine should not be coupled to any specific config shape.
  compile(env: any, config?: any): any;
  runAsync(context: any, env: any, config?: any, options?: any): Promise<void>;
};

export type RuntimeRecipeEntry = {
  id: StudioRecipeId;
  label: string;
  recipe: RecipeRuntimeModule;
  defaultConfig: unknown;
  configSchema: unknown;
};

function makeRecipeId(namespace: string, recipeId: string): StudioRecipeId {
  return `${namespace}/${recipeId}`;
}

const RUNTIME_RECIPES: readonly RuntimeRecipeEntry[] = [
  {
    id: makeRecipeId("mod-swooper-maps", "standard"),
    label: "Swooper Maps / Standard",
    recipe: standardRecipe,
    defaultConfig: swooperStandardDefaultConfig,
    configSchema: swooperStandardConfigSchema,
  },
  {
    id: makeRecipeId("mod-swooper-maps", "browser-test"),
    label: "Swooper Maps / Browser Test",
    recipe: browserTestRecipe,
    defaultConfig: swooperBrowserTestDefaultConfig,
    configSchema: swooperBrowserTestConfigSchema,
  },
] as const;

export function getRuntimeRecipe(recipeId: StudioRecipeId): RuntimeRecipeEntry {
  const entry = RUNTIME_RECIPES.find((r) => r.id === recipeId);
  if (!entry) throw new Error(`Unknown recipeId: ${recipeId}`);
  return entry;
}
