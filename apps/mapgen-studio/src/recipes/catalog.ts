export type StudioRecipeId = string;

export type StudioRecipeUiMeta = Readonly<{
  namespace: string;
  recipeId: string;
  stages: ReadonlyArray<
    Readonly<{
      stageId: string;
      stageLabel: string;
      steps: ReadonlyArray<
        Readonly<{
          stepId: string;
          stepLabel: string;
          fullStepId: string;
          configFocusPathWithinStage: ReadonlyArray<string>;
        }>
      >;
    }>
  >;
}>;

export type RecipeArtifacts = {
  id: StudioRecipeId;
  label: string;
  /**
   * JSON-schema-ish object that drives the config overrides UI.
   *
   * Treated as unknown by Studio so recipes can choose their own schema tooling.
   */
  configSchema: unknown;
  /**
   * Default recipe config object (used as the base for overrides).
   *
   * Treated as unknown by Studio so each recipe controls its config shape.
   */
  defaultConfig: unknown;
  /**
   * UI-facing meta derived from the authored recipe/stage source at build time.
   *
   * - stages/steps are for view/navigation (no pipeline semantics changes)
   * - config focus paths are for pre-generation editing focus
   */
  uiMeta: StudioRecipeUiMeta;
};

export type RecipeOption = { id: StudioRecipeId; label: string };

function makeRecipeId(namespace: string, recipeId: string): StudioRecipeId {
  return `${namespace}/${recipeId}`;
}

// This is a bundled catalog for the current Studio build. Studio's engine code
// only depends on the generic `RecipeArtifacts` interface, not on any one recipe.
import {
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  studioRecipeUiMeta as swooperStandardUiMeta,
} from "mod-swooper-maps/recipes/standard-artifacts";
import {
  BROWSER_TEST_RECIPE_CONFIG as swooperBrowserTestDefaultConfig,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA as swooperBrowserTestConfigSchema,
  studioRecipeUiMeta as swooperBrowserTestUiMeta,
} from "mod-swooper-maps/recipes/browser-test-artifacts";
import { SWOOPER_EARTHLIKE_DEFAULT_CONFIG } from "./defaultConfigs/swooperEarthlike";

export const STUDIO_RECIPE_ARTIFACTS: readonly RecipeArtifacts[] = [
  {
    id: makeRecipeId("mod-swooper-maps", "standard"),
    label: "Swooper Maps / Standard",
    configSchema: swooperStandardConfigSchema,
    // Keep Studio defaults aligned with the canonical Swooper Earthlike map config.
    defaultConfig: SWOOPER_EARTHLIKE_DEFAULT_CONFIG,
    uiMeta: swooperStandardUiMeta,
  },
  {
    id: makeRecipeId("mod-swooper-maps", "browser-test"),
    label: "Swooper Maps / Browser Test",
    configSchema: swooperBrowserTestConfigSchema,
    defaultConfig: swooperBrowserTestDefaultConfig,
    uiMeta: swooperBrowserTestUiMeta,
  },
] as const;

export const STUDIO_RECIPE_OPTIONS: readonly RecipeOption[] = STUDIO_RECIPE_ARTIFACTS.map((r) => ({
  id: r.id,
  label: r.label,
}));

export const DEFAULT_STUDIO_RECIPE_ID: StudioRecipeId = STUDIO_RECIPE_ARTIFACTS[0]?.id ?? "unknown/unknown";

export function getRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts {
  const recipe = STUDIO_RECIPE_ARTIFACTS.find((r) => r.id === recipeId);
  if (!recipe) throw new Error(`Unknown recipeId: ${recipeId}`);
  return recipe;
}
