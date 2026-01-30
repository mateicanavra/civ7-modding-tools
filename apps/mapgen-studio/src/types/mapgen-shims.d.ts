declare module "@mapgen/browser-test-recipe" {
  import type { ExtendedMapContext } from "@swooper/mapgen-core";
  import type { RecipeModule } from "@swooper/mapgen-core/authoring";
  import type { TSchema } from "typebox";

  export type BrowserTestRecipeConfig = Readonly<{
    foundation?: Readonly<Record<string, unknown>>;
  }>;

  export const BROWSER_TEST_RECIPE_CONFIG: BrowserTestRecipeConfig;
  export const BROWSER_TEST_RECIPE_CONFIG_SCHEMA: TSchema;

  const recipe: RecipeModule<ExtendedMapContext, BrowserTestRecipeConfig, unknown>;
  export default recipe;
}

