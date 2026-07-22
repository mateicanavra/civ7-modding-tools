import {
  freezeSnapshot,
  type MapConfigEnvelope,
  serializeMapConfigEnvelope,
  setupConfig as setupConfigSchema,
} from "@civ7/studio-contract";
import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { Value } from "typebox/value";
import { parseCiv7StudioSeed } from "../civ7Setup/seedPolicy";
import {
  type Civ7StudioSetupConfig,
  migrateLegacyStudioSetupConfig,
  normalizeStudioSetupConfig,
} from "../civ7Setup/setupConfig";
import { admitCanonicalConfig } from "../configAuthoring/canonicalConfig";

/** Current browser-storage key for the closed v5 Studio authoring snapshot. */
export const STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v5";
const LEGACY_V4_STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v4";
const LEGACY_V3_STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v3";

export type StudioAuthoringStateSnapshot = Readonly<{
  schemaVersion: 5;
  savedAt: string;
  worldSettings: WorldSettings;
  seed: string;
  gameSeed: string;
  setupConfig: Civ7StudioSetupConfig;
  canonicalConfig: MapConfigEnvelope;
}>;

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type StudioAuthoringData = Omit<StudioAuthoringStateSnapshot, "schemaVersion" | "savedAt">;

function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === "undefined" ? null : (window.localStorage ?? null);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactlyKeys(value: Record<string, unknown>, keys: ReadonlyArray<string>): boolean {
  const actual = Object.keys(value).sort();
  return (
    actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index])
  );
}

function parseWorldSettings(value: unknown): WorldSettings | undefined {
  if (!isRecord(value) || !hasExactlyKeys(value, ["mapSize", "playerCount", "resources"])) {
    return undefined;
  }
  const mapSizes: readonly WorldSettings["mapSize"][] = [
    "MAPSIZE_TINY",
    "MAPSIZE_SMALL",
    "MAPSIZE_STANDARD",
    "MAPSIZE_LARGE",
    "MAPSIZE_HUGE",
  ];
  const resources: readonly WorldSettings["resources"][] = ["balanced", "strategic"];
  const mapSize = mapSizes.find((entry) => entry === value.mapSize);
  const resourceMode = resources.find((entry) => entry === value.resources);
  return mapSize !== undefined && resourceMode !== undefined && Number.isInteger(value.playerCount)
    ? { mapSize, playerCount: value.playerCount as number, resources: resourceMode }
    : undefined;
}

function admitPersistedSeed(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const parsed = parseCiv7StudioSeed(value);
  return parsed.ok ? String(parsed.value) : undefined;
}

function parseStudioAuthoringData(
  parsed: Record<string, unknown>,
  seed: string,
  gameSeed: string
): StudioAuthoringData | null {
  const worldSettings = parseWorldSettings(parsed.worldSettings);
  const canonicalConfig = admitCanonicalConfig(parsed.canonicalConfig);
  if (
    worldSettings === undefined ||
    canonicalConfig === undefined ||
    !Value.Check(setupConfigSchema, parsed.setupConfig)
  ) {
    return null;
  }
  return {
    worldSettings,
    seed,
    gameSeed,
    setupConfig: freezeSnapshot(Value.Parse(setupConfigSchema, Value.Clone(parsed.setupConfig))),
    canonicalConfig,
  };
}

export function parseStudioAuthoringState(
  value: string | null
): StudioAuthoringStateSnapshot | null {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      !hasExactlyKeys(parsed, [
        "schemaVersion",
        "savedAt",
        "worldSettings",
        "seed",
        "gameSeed",
        "setupConfig",
        "canonicalConfig",
      ]) ||
      parsed.schemaVersion !== 5 ||
      typeof parsed.savedAt !== "string"
    ) {
      return null;
    }
    const seed = admitPersistedSeed(parsed.seed);
    const gameSeed = admitPersistedSeed(parsed.gameSeed);
    if (seed === undefined || gameSeed === undefined) return null;
    const data = parseStudioAuthoringData(parsed, seed, gameSeed);
    if (data === null) return null;
    return {
      schemaVersion: 5,
      savedAt: parsed.savedAt,
      ...data,
    };
  } catch {
    return null;
  }
}

function parseLegacyStudioAuthoringState(
  value: string | null,
  version: 3 | 4
): StudioAuthoringData | null {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      !hasExactlyKeys(
        parsed,
        version === 3
          ? ["schemaVersion", "savedAt", "worldSettings", "seed", "setupConfig", "canonicalConfig"]
          : [
              "schemaVersion",
              "savedAt",
              "worldSettings",
              "seed",
              "gameSeed",
              "setupConfig",
              "canonicalConfig",
            ]
      ) ||
      parsed.schemaVersion !== version ||
      typeof parsed.savedAt !== "string"
    ) {
      return null;
    }
    const seed = admitPersistedSeed(parsed.seed);
    const gameSeed = version === 3 ? seed : admitPersistedSeed(parsed.gameSeed);
    if (seed === undefined || gameSeed === undefined) return null;
    const setupConfig = migrateLegacyStudioSetupConfig(parsed.setupConfig);
    return setupConfig === undefined
      ? null
      : parseStudioAuthoringData({ ...parsed, setupConfig }, seed, gameSeed);
  } catch {
    return null;
  }
}

export function loadStudioAuthoringState(
  storage: KeyValueStorage | null = browserStorage()
): StudioAuthoringStateSnapshot | null {
  if (storage === null) return null;
  try {
    const current = storage.getItem(STUDIO_AUTHORING_STATE_KEY);
    if (current !== null) return parseStudioAuthoringState(current);
    const legacy =
      parseLegacyStudioAuthoringState(storage.getItem(LEGACY_V4_STUDIO_AUTHORING_STATE_KEY), 4) ??
      parseLegacyStudioAuthoringState(storage.getItem(LEGACY_V3_STUDIO_AUTHORING_STATE_KEY), 3);
    if (legacy === null) return null;
    saveStudioAuthoringState(legacy, storage);
    const migrated = parseStudioAuthoringState(storage.getItem(STUDIO_AUTHORING_STATE_KEY));
    if (migrated !== null) {
      storage.removeItem(LEGACY_V4_STUDIO_AUTHORING_STATE_KEY);
      storage.removeItem(LEGACY_V3_STUDIO_AUTHORING_STATE_KEY);
    }
    return migrated;
  } catch {
    return null;
  }
}

/** Retires every persisted authoring-state version so cleared state cannot remigrate. */
export function retireStudioAuthoringState(
  storage: KeyValueStorage | null = browserStorage()
): void {
  if (storage === null) return;
  try {
    storage.removeItem(STUDIO_AUTHORING_STATE_KEY);
    storage.removeItem(LEGACY_V4_STUDIO_AUTHORING_STATE_KEY);
    storage.removeItem(LEGACY_V3_STUDIO_AUTHORING_STATE_KEY);
  } catch {
    // Refresh recovery removal is best effort.
  }
}

export function saveStudioAuthoringState(
  args: Omit<StudioAuthoringStateSnapshot, "schemaVersion" | "savedAt">,
  storage: KeyValueStorage | null = browserStorage()
): void {
  if (storage === null) return;
  const seed = admitPersistedSeed(args.seed);
  const gameSeed = admitPersistedSeed(args.gameSeed);
  if (seed === undefined || gameSeed === undefined) return;
  const canonicalConfig = admitCanonicalConfig(args.canonicalConfig);
  if (canonicalConfig === undefined) return;
  try {
    storage.setItem(
      STUDIO_AUTHORING_STATE_KEY,
      JSON.stringify({
        schemaVersion: 5,
        savedAt: new Date().toISOString(),
        worldSettings: args.worldSettings,
        seed,
        gameSeed,
        setupConfig: normalizeStudioSetupConfig(args.setupConfig),
        canonicalConfig: serializeMapConfigEnvelope(canonicalConfig),
      })
    );
  } catch {
    // Refresh recovery must not break live authoring.
  }
}
