import {
  isMapConfigEnvelope,
  serializeMapConfigEnvelope,
  snapshotMapConfigEnvelope,
} from "@civ7/studio-contract";
import type { RecipeSettings, WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { findBuiltInPresetBySourcePath, findRecipeArtifacts } from "../../recipes/catalog";
import {
  type Civ7StudioSetupConfig,
  createDefaultCiv7StudioSetupConfig,
  normalizeStudioSetupConfig,
} from "../civ7Setup/setupConfig";
import { admitPipelineConfig } from "../configAuthoring/canonicalConfig";
import { type AuthoringConfigSource, parsePresetKey } from "../presets/types";

export const STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v2";

const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};

const DEFAULT_RECIPE_SETTINGS: RecipeSettings = {
  recipe: "mod-swooper-maps/standard",
  preset: "none",
  seed: "123",
};

export type StudioAuthoringStateSnapshot = Readonly<{
  schemaVersion: 2;
  savedAt: string;
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  setupConfig: Civ7StudioSetupConfig;
  authoringConfigSource: AuthoringConfigSource;
  configEditingEnabled: boolean;
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
    typeof value.seed !== "string" ||
    (value.preset !== "none" && parsePresetKey(value.preset).kind !== "builtin")
  ) {
    return null;
  }
  return {
    recipe: value.recipe,
    preset: value.preset,
    seed: value.seed,
  };
}

function hasOnlyKeys(value: Record<string, unknown>, keys: ReadonlyArray<string>): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function blockedAuthoringState(args: {
  reason: "missing-catalog-source" | "invalid-persistence";
  sourcePath?: string;
  worldSettings?: WorldSettings;
  recipeSettings?: RecipeSettings;
  setupConfig?: Civ7StudioSetupConfig;
  configEditingEnabled?: boolean;
}): StudioAuthoringStateSnapshot {
  return {
    schemaVersion: 2,
    savedAt: new Date(0).toISOString(),
    worldSettings: args.worldSettings ?? DEFAULT_WORLD_SETTINGS,
    recipeSettings: args.recipeSettings ?? DEFAULT_RECIPE_SETTINGS,
    setupConfig: args.setupConfig ?? createDefaultCiv7StudioSetupConfig(),
    authoringConfigSource: {
      kind: "blocked",
      reason: args.reason,
      ...(args.sourcePath === undefined ? {} : { sourcePath: args.sourcePath }),
    },
    configEditingEnabled: args.configEditingEnabled !== false,
  };
}

function parseAuthoringConfigSource(args: {
  value: unknown;
  recipeSettings: RecipeSettings;
}): AuthoringConfigSource {
  if (!isRecord(args.value) || typeof args.value.kind !== "string") {
    return { kind: "blocked", reason: "invalid-persistence" };
  }
  if (args.value.kind === "catalog") {
    if (
      !hasOnlyKeys(args.value, ["kind", "sourcePath"]) ||
      typeof args.value.sourcePath !== "string" ||
      args.value.sourcePath.length === 0
    ) {
      return { kind: "blocked", reason: "invalid-persistence" };
    }
    return findBuiltInPresetBySourcePath(args.recipeSettings.recipe, args.value.sourcePath)
      ? { kind: "catalog", sourcePath: args.value.sourcePath }
      : {
          kind: "blocked",
          reason: "missing-catalog-source",
          sourcePath: args.value.sourcePath,
        };
  }
  if (args.value.kind === "editor") {
    if (!hasOnlyKeys(args.value, ["kind", "canonicalConfig"])) {
      return { kind: "blocked", reason: "invalid-persistence" };
    }
    const canonicalConfig = snapshotMapConfigEnvelope(args.value.canonicalConfig);
    if (canonicalConfig === undefined) {
      return { kind: "blocked", reason: "invalid-persistence" };
    }
    const recipeArtifacts = findRecipeArtifacts(args.recipeSettings.recipe);
    if (!recipeArtifacts) return { kind: "blocked", reason: "invalid-persistence" };
    const admitted = admitPipelineConfig({
      schema: recipeArtifacts.configSchema,
      config: canonicalConfig.config,
      label: "persisted-editor",
    });
    if (!admitted.ok) return { kind: "blocked", reason: "invalid-persistence" };
    return { kind: "editor", canonicalConfig };
  }
  if (args.value.kind === "blocked") {
    if (
      !hasOnlyKeys(args.value, ["kind", "reason", "sourcePath"]) ||
      (args.value.reason !== "missing-catalog-source" &&
        args.value.reason !== "invalid-persistence") ||
      (args.value.sourcePath !== undefined && typeof args.value.sourcePath !== "string")
    ) {
      return { kind: "blocked", reason: "invalid-persistence" };
    }
    return {
      kind: "blocked",
      reason: args.value.reason,
      ...(typeof args.value.sourcePath === "string" ? { sourcePath: args.value.sourcePath } : {}),
    };
  }
  return { kind: "blocked", reason: "invalid-persistence" };
}

function serializeAuthoringConfigSource(source: AuthoringConfigSource): unknown {
  return source.kind === "editor"
    ? {
        kind: "editor",
        canonicalConfig: serializeMapConfigEnvelope(source.canonicalConfig),
      }
    : source;
}

function canPersistAuthoringConfigSource(args: {
  source: AuthoringConfigSource;
  recipeSettings: RecipeSettings;
}): boolean {
  if (args.source.kind === "blocked") return true;
  if (args.source.kind === "catalog") {
    return (
      findBuiltInPresetBySourcePath(args.recipeSettings.recipe, args.source.sourcePath) !== null
    );
  }
  if (!isMapConfigEnvelope(args.source.canonicalConfig)) return false;
  const recipeArtifacts = findRecipeArtifacts(args.recipeSettings.recipe);
  return (
    recipeArtifacts !== null &&
    admitPipelineConfig({
      schema: recipeArtifacts.configSchema,
      config: args.source.canonicalConfig.config,
      label: "persisted-editor",
    }).ok
  );
}

export function parseStudioAuthoringState(
  value: string | null
): StudioAuthoringStateSnapshot | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) {
      return blockedAuthoringState({ reason: "invalid-persistence" });
    }
    if (
      !hasOnlyKeys(parsed, [
        "schemaVersion",
        "savedAt",
        "worldSettings",
        "recipeSettings",
        "setupConfig",
        "authoringConfigSource",
        "configEditingEnabled",
      ]) ||
      parsed.schemaVersion !== 2 ||
      typeof parsed.savedAt !== "string" ||
      typeof parsed.configEditingEnabled !== "boolean"
    ) {
      return blockedAuthoringState({ reason: "invalid-persistence" });
    }
    const worldSettings = parseWorldSettings(parsed.worldSettings);
    const recipeSettings = parseRecipeSettings(parsed.recipeSettings);
    if (!worldSettings || !recipeSettings) {
      return blockedAuthoringState({ reason: "invalid-persistence" });
    }
    const authoringConfigSource = parseAuthoringConfigSource({
      value: parsed.authoringConfigSource,
      recipeSettings,
    });
    return {
      schemaVersion: 2,
      savedAt: parsed.savedAt,
      worldSettings,
      recipeSettings,
      setupConfig: normalizeStudioSetupConfig(
        parsed.setupConfig ?? createDefaultCiv7StudioSetupConfig()
      ),
      authoringConfigSource,
      configEditingEnabled: parsed.configEditingEnabled,
    };
  } catch {
    return blockedAuthoringState({ reason: "invalid-persistence" });
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
    if (
      !canPersistAuthoringConfigSource({
        source: args.authoringConfigSource,
        recipeSettings: args.recipeSettings,
      })
    ) {
      return;
    }
    storage.setItem(
      STUDIO_AUTHORING_STATE_KEY,
      JSON.stringify({
        schemaVersion: 2,
        savedAt: new Date().toISOString(),
        worldSettings: args.worldSettings,
        recipeSettings: args.recipeSettings,
        setupConfig: normalizeStudioSetupConfig(args.setupConfig),
        authoringConfigSource: serializeAuthoringConfigSource(args.authoringConfigSource),
        configEditingEnabled: args.configEditingEnabled,
      })
    );
  } catch {
    // Persistence is a refresh recovery aid; it must not break authoring.
  }
}
