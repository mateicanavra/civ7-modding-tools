import type { BuiltInPreset } from "../../recipes/catalog";
import type { PipelineConfig, RecipeSettings, WorldSettings } from "../../ui/types";
import {
  type Civ7StudioSetupConfig,
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
  normalizeStudioSetupConfig,
} from "../civ7Setup/setupConfig";
import {
  migratePipelineConfig,
  migratePipelineConfigUnknown,
} from "../configMigrations/pipelineConfig";

export const STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v1";

export type StudioAuthoringStateSnapshot = Readonly<{
  schemaVersion: 1;
  savedAt: string;
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  setupConfig: Civ7StudioSetupConfig;
  pipelineConfig: PipelineConfig;
  overridesDisabled: boolean;
  repoBackedPresetOverridesByRecipe: Record<string, Record<string, BuiltInPreset>>;
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

function parseBuiltInPreset(value: unknown): BuiltInPreset | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.label !== "string" || !isRecord(value.config))
    return null;
  return {
    id: value.id,
    label: value.label,
    ...(typeof value.description === "string" ? { description: value.description } : {}),
    ...(typeof value.sourcePath === "string" ? { sourcePath: value.sourcePath } : {}),
    ...(typeof value.sortIndex === "number" ? { sortIndex: value.sortIndex } : {}),
    ...(isRecord(value.latitudeBounds)
      ? { latitudeBounds: value.latitudeBounds as BuiltInPreset["latitudeBounds"] }
      : {}),
    config: migratePipelineConfigUnknown(value.config),
  };
}

function parseRepoBackedOverrides(value: unknown): Record<string, Record<string, BuiltInPreset>> {
  if (!isRecord(value)) return {};
  const out: Record<string, Record<string, BuiltInPreset>> = {};
  for (const [recipeId, presets] of Object.entries(value)) {
    if (!isRecord(presets)) continue;
    const recipePresets: Record<string, BuiltInPreset> = {};
    for (const [presetId, preset] of Object.entries(presets)) {
      const parsed = parseBuiltInPreset(preset);
      if (parsed) recipePresets[presetId] = parsed;
    }
    if (Object.keys(recipePresets).length > 0) out[recipeId] = recipePresets;
  }
  return out;
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
    return {
      schemaVersion: 1,
      savedAt: parsed.savedAt,
      worldSettings,
      recipeSettings,
      setupConfig: normalizeStudioSetupConfig(
        parsed.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG
      ),
      pipelineConfig: migratePipelineConfig(parsed.pipelineConfig as PipelineConfig),
      overridesDisabled: parsed.overridesDisabled === true,
      repoBackedPresetOverridesByRecipe: parseRepoBackedOverrides(
        parsed.repoBackedPresetOverridesByRecipe
      ),
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
    storage.setItem(
      STUDIO_AUTHORING_STATE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        worldSettings: args.worldSettings,
        recipeSettings: args.recipeSettings,
        setupConfig: normalizeStudioSetupConfig(args.setupConfig),
        pipelineConfig: migratePipelineConfig(args.pipelineConfig),
        overridesDisabled: args.overridesDisabled,
        repoBackedPresetOverridesByRecipe: parseRepoBackedOverrides(
          args.repoBackedPresetOverridesByRecipe
        ),
      })
    );
  } catch {
    // Persistence is a refresh recovery aid; it must not break authoring.
  }
}
