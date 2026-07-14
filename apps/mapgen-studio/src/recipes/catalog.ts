import { type MapConfigEnvelope, snapshotMapConfigEnvelope } from "@civ7/studio-contract";
import { validateStandardMapConfigSnapshotForSchema } from "mod-swooper-maps/maps/configs/standard-admission";
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

export type RecipeArtifacts = Readonly<{
  id: StudioRecipeId;
  label: string;
  /** Raw JSON Schema used for interpreted config validation and the authoring UI. */
  configSchema: XSchema;
  /** Complete default installed atomically when the recipe is selected. */
  defaultCanonicalConfig: MapConfigEnvelope;
  /** Complete named configs available in the bundled catalog. */
  catalogConfigs: ReadonlyArray<MapConfigEnvelope>;
  /** UI-facing stage metadata derived from the authored recipe source. */
  uiMeta: StudioRecipeUiMeta;
  /** Applies recipe-owned semantic admission without rebuilding the envelope. */
  admitCanonicalConfig: (config: MapConfigEnvelope) => MapConfigEnvelope;
}>;

export type RecipeOption = Readonly<{ id: StudioRecipeId; label: string }>;

import {
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
  studioRecipeUiMeta as swooperStandardUiMeta,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { standardMapConfigs as swooperStandardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";

function requireCanonicalConfig(value: unknown, label: string): MapConfigEnvelope {
  const snapshot = snapshotMapConfigEnvelope(value);
  if (snapshot === undefined) throw new TypeError(`Invalid Studio config: ${label}`);
  return snapshot;
}

const standardCatalogConfigs = swooperStandardMapConfigs.map(({ canonicalConfig }) =>
  requireCanonicalConfig(canonicalConfig, canonicalConfig.id)
);

const standardDefaultCanonicalConfig = requireCanonicalConfig(
  {
    id: "studio-current",
    name: "Studio Current",
    description: "Current Studio configuration.",
    recipe: "standard",
    sortIndex: 9999,
    latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    config: swooperStandardDefaultConfig,
  },
  "standard default"
);

export const STUDIO_RECIPE_ARTIFACTS: readonly RecipeArtifacts[] = [
  {
    id: "standard",
    label: "Swooper Maps / Standard",
    configSchema: swooperStandardConfigSchema,
    defaultCanonicalConfig: standardDefaultCanonicalConfig,
    catalogConfigs: standardCatalogConfigs,
    uiMeta: swooperStandardUiMeta,
    admitCanonicalConfig: (config) =>
      validateStandardMapConfigSnapshotForSchema(config, swooperStandardConfigSchema),
  },
] as const;

export const STUDIO_RECIPE_OPTIONS: readonly RecipeOption[] = STUDIO_RECIPE_ARTIFACTS.map((r) => ({
  id: r.id,
  label: r.label,
}));

export const DEFAULT_STUDIO_RECIPE_ID: StudioRecipeId =
  STUDIO_RECIPE_ARTIFACTS[0]?.id ?? "standard";

export function findRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts | null {
  return STUDIO_RECIPE_ARTIFACTS.find((recipe) => recipe.id === recipeId) ?? null;
}

export function getRecipeArtifacts(recipeId: StudioRecipeId): RecipeArtifacts {
  const recipe = findRecipeArtifacts(recipeId);
  if (recipe === null) throw new Error(`Unknown recipeId: ${recipeId}`);
  return recipe;
}

/** Returns the namespaced identity used only by the presentation DAG service. */
export function getRecipeDagId(recipeId: StudioRecipeId): string {
  const { namespace, recipeId: authoredRecipeId } = getRecipeArtifacts(recipeId).uiMeta;
  return `${namespace}/${authoredRecipeId}`;
}

export function findCatalogConfig(
  recipeId: StudioRecipeId,
  configId: string
): MapConfigEnvelope | null {
  return (
    findRecipeArtifacts(recipeId)?.catalogConfigs.find((config) => config.id === configId) ?? null
  );
}
