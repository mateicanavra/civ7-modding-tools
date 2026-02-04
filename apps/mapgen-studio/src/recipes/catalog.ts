import type { TSchema } from "@swooper/mapgen-core/authoring";

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

export type BuiltInPreset = Readonly<{
  id: string;
  label: string;
  description?: string;
  config: unknown;
}>;

export type RecipeArtifacts<TConfig = unknown> = {
  id: StudioRecipeId;
  label: string;
  /**
   * JSON-schema-ish object that drives the config overrides UI.
   *
   * Treated as unknown by Studio so recipes can choose their own schema tooling.
   */
  configSchema: TSchema;
  /**
   * Default recipe config object (used as the base for overrides).
   *
   * Treated as unknown by Studio so each recipe controls its config shape.
   */
  defaultConfig: TConfig;
  /**
   * UI-facing meta derived from the authored recipe/stage source at build time.
   *
   * - stages/steps are for view/navigation (no pipeline semantics changes)
   * - config focus paths are for pre-generation editing focus
   */
  uiMeta: StudioRecipeUiMeta;
  /**
   * Built-in presets authored in the recipe package and emitted via artifacts.
   */
  studioBuiltInPresets?: ReadonlyArray<BuiltInPreset>;
};

export type RecipeOption = { id: StudioRecipeId; label: string };

function makeRecipeId(namespace: string, recipeId: string): StudioRecipeId {
  return `${namespace}/${recipeId}`;
}

// This is a bundled catalog for the current Studio build. Studio's engine code
// only depends on the generic `RecipeArtifacts` interface, not on any one recipe.
import {
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  studioBuiltInPresets as swooperStandardBuiltInPresets,
  studioRecipeUiMeta as swooperStandardUiMeta,
} from "mod-swooper-maps/recipes/standard-artifacts";
import {
  BROWSER_TEST_RECIPE_CONFIG as swooperBrowserTestDefaultConfig,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA as swooperBrowserTestConfigSchema,
  studioBuiltInPresets as swooperBrowserTestBuiltInPresets,
  studioRecipeUiMeta as swooperBrowserTestUiMeta,
} from "mod-swooper-maps/recipes/browser-test-artifacts";

export const STUDIO_RECIPE_ARTIFACTS: readonly RecipeArtifacts[] = [
  {
    id: makeRecipeId("mod-swooper-maps", "standard"),
    label: "Swooper Maps / Standard",
    configSchema: swooperStandardConfigSchema,
    defaultConfig: swooperStandardDefaultConfig,
    uiMeta: swooperStandardUiMeta,
    studioBuiltInPresets: swooperStandardBuiltInPresets,
  },
  {
    id: makeRecipeId("mod-swooper-maps", "browser-test"),
    label: "Swooper Maps / Browser Test",
    configSchema: swooperBrowserTestConfigSchema,
    defaultConfig: swooperBrowserTestDefaultConfig,
    uiMeta: swooperBrowserTestUiMeta,
    studioBuiltInPresets: swooperBrowserTestBuiltInPresets,
  },
] as const;

export const STUDIO_RECIPE_OPTIONS: readonly RecipeOption[] = STUDIO_RECIPE_ARTIFACTS.map((r) => ({
  id: r.id,
  label: r.label,
}));

export const DEFAULT_STUDIO_RECIPE_ID: StudioRecipeId = STUDIO_RECIPE_ARTIFACTS[0]?.id ?? "unknown/unknown";

export function findRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts | null {
  return STUDIO_RECIPE_ARTIFACTS.find((r) => r.id === recipeId) ?? null;
}

export function getRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts {
  const recipe = STUDIO_RECIPE_ARTIFACTS.find((r) => r.id === recipeId);
  if (!recipe) throw new Error(`Unknown recipeId: ${recipeId}`);
  return recipe;
}
