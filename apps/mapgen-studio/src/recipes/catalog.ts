import { type MapConfigEnvelope, snapshotMapConfigEnvelope } from "@civ7/studio-contract";
import type { XSchema } from "typebox/schema";

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
  sourcePath: string;
  canonicalConfig: MapConfigEnvelope;
}>;

export type RecipeArtifacts<TConfig = unknown> = {
  id: StudioRecipeId;
  label: string;
  /** Raw JSON Schema used for interpreted config validation and the authoring UI. */
  configSchema: XSchema;
  /**
   * Complete default recipe config object produced by recipe artifacts.
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

// This is a bundled catalog for the current Studio build. Recipe schema/default
// contracts are generated from recipe package source by `build:studio-recipes`
// and exported as first-class package artifacts; Studio does not treat `dist/`
// or generated output as editable policy.
import {
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
  studioRecipeUiMeta as swooperStandardUiMeta,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { standardMapConfigs as swooperStandardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";

export const STUDIO_RECIPE_ARTIFACTS: readonly RecipeArtifacts[] = [
  {
    id: makeRecipeId("mod-swooper-maps", "standard"),
    label: "Swooper Maps / Standard",
    configSchema: swooperStandardConfigSchema,
    defaultConfig: swooperStandardDefaultConfig,
    uiMeta: swooperStandardUiMeta,
    studioBuiltInPresets: swooperStandardMapConfigs.map(({ sourcePath, canonicalConfig }) => {
      const snapshot = snapshotMapConfigEnvelope(canonicalConfig);
      if (snapshot === undefined) {
        throw new TypeError(`Invalid generated Studio catalog config: ${sourcePath}`);
      }
      return { sourcePath, canonicalConfig: snapshot };
    }),
  },
] as const;

export const STUDIO_RECIPE_OPTIONS: readonly RecipeOption[] = STUDIO_RECIPE_ARTIFACTS.map((r) => ({
  id: r.id,
  label: r.label,
}));

export const DEFAULT_STUDIO_RECIPE_ID: StudioRecipeId =
  STUDIO_RECIPE_ARTIFACTS[0]?.id ?? "unknown/unknown";

export function findRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts | null {
  return STUDIO_RECIPE_ARTIFACTS.find((r) => r.id === recipeId) ?? null;
}

/** Catalog resolution stays in generated recipe artifacts, never browser storage. */
export function findBuiltInPresetBySourcePath(
  recipeId: StudioRecipeId,
  sourcePath: string
): BuiltInPreset | null {
  return (
    findRecipeArtifacts(recipeId)?.studioBuiltInPresets?.find(
      (preset) => preset.sourcePath === sourcePath
    ) ?? null
  );
}

export function getRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts {
  const recipe = STUDIO_RECIPE_ARTIFACTS.find((r) => r.id === recipeId);
  if (!recipe) throw new Error(`Unknown recipeId: ${recipeId}`);
  return recipe;
}
