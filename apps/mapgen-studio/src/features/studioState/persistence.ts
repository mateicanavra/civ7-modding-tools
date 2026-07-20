import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import {
  type Civ7StudioSetupConfig,
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
  normalizeStudioSetupConfig,
} from "../civ7Setup/setupConfig";
import { materializePipelineConfig } from "../configOverrides/configBuilders";
import { resolveEffectivePipelineConfig } from "../configOverrides/effectiveConfig";
import { findRecipeArtifacts } from "../../recipes/catalog";

export const STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v1";

export type StudioAuthoringStateSnapshot = Readonly<{
  schemaVersion: 1;
  savedAt: string;
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  setupConfig: Civ7StudioSetupConfig;
  pipelineConfig: PipelineConfig;
  overridesDisabled: boolean;
}>;

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): KeyValueStorage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseWorldSettings(value: unknown): WorldSettings | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.mapSize !== "string" ||
    typeof value.playerCount !== "number" ||
    typeof value.resources !== "string"
  ) {
    return null;
  }
  return {
    mapSize: value.mapSize as WorldSettings["mapSize"],
    playerCount: value.playerCount,
    resources: value.resources as WorldSettings["resources"],
  };
}

function parseRecipeSettings(value: unknown): RecipeSettings | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.recipe !== "string" ||
    typeof value.preset !== "string" ||
    typeof value.seed !== "string"
  ) {
    return null;
  }
  return {
    recipe: value.recipe,
    preset: value.preset,
    seed: value.seed,
  };
}

export function parseStudioAuthoringState(
  value: string | null
): StudioAuthoringStateSnapshot | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed) || parsed.schemaVersion !== 1 || typeof parsed.savedAt !== "string")
      return null;
    const worldSettings = parseWorldSettings(parsed.worldSettings);
    const recipeSettings = parseRecipeSettings(parsed.recipeSettings);
    if (!worldSettings || !recipeSettings || !isRecord(parsed.pipelineConfig)) return null;
    const recipeArtifacts = findRecipeArtifacts(recipeSettings.recipe);
    if (!recipeArtifacts) return null;
    const pipelineConfig = materializePipelineConfig({
      schema: recipeArtifacts.configSchema,
      config: parsed.pipelineConfig,
      label: "persisted-authoring",
    });
    if (!pipelineConfig.ok) return null;
    return {
      schemaVersion: 1,
      savedAt: parsed.savedAt,
      worldSettings,
      recipeSettings,
      setupConfig: normalizeStudioSetupConfig(
        parsed.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG
      ),
      pipelineConfig: pipelineConfig.value,
      overridesDisabled: parsed.overridesDisabled === true,
    };
  } catch {
    return null;
  }
}

export function loadStudioAuthoringState(
  storage: KeyValueStorage | null = browserStorage()
): StudioAuthoringStateSnapshot | null {
  if (!storage) return null;
  try {
    return parseStudioAuthoringState(storage.getItem(STUDIO_AUTHORING_STATE_KEY));
  } catch {
    return null;
  }
}

export function saveStudioAuthoringState(
  args: Omit<StudioAuthoringStateSnapshot, "schemaVersion" | "savedAt">,
  storage: KeyValueStorage | null = browserStorage()
): void {
  if (!storage) return;
  try {
    const effectiveConfig = resolveEffectivePipelineConfig({
      recipeId: args.recipeSettings.recipe,
      pipelineConfig: args.pipelineConfig,
      overridesDisabled: args.overridesDisabled,
    });
    const pipelineConfig = materializePipelineConfig({
      schema: effectiveConfig.recipeArtifacts.configSchema,
      config: effectiveConfig.config,
      label: "persisted-authoring",
    });
    if (!pipelineConfig.ok) return;
    storage.setItem(
      STUDIO_AUTHORING_STATE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        worldSettings: args.worldSettings,
        recipeSettings: args.recipeSettings,
        setupConfig: normalizeStudioSetupConfig(args.setupConfig),
        pipelineConfig: pipelineConfig.value,
        overridesDisabled: args.overridesDisabled,
      })
    );
  } catch {
    // Persistence is a refresh recovery aid; it must not break authoring.
  }
}
