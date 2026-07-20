import {
  freezeSnapshot,
  type MapConfigEnvelope,
  serializeMapConfigEnvelope,
  setupConfig as setupConfigSchema,
} from "@civ7/studio-contract";
import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { Value } from "typebox/value";
import { type Civ7StudioSetupConfig, normalizeStudioSetupConfig } from "../civ7Setup/setupConfig";
import { admitCanonicalConfig } from "../configAuthoring/canonicalConfig";

export const STUDIO_AUTHORING_STATE_KEY = "mapgen-studio.authoring-state.v3";

export type StudioAuthoringStateSnapshot = Readonly<{
  schemaVersion: 3;
  savedAt: string;
  worldSettings: WorldSettings;
  seed: string;
  setupConfig: Civ7StudioSetupConfig;
  canonicalConfig: MapConfigEnvelope;
}>;

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

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
        "setupConfig",
        "canonicalConfig",
      ]) ||
      parsed.schemaVersion !== 3 ||
      typeof parsed.savedAt !== "string" ||
      typeof parsed.seed !== "string"
    ) {
      return null;
    }
    const worldSettings = parseWorldSettings(parsed.worldSettings);
    const canonicalConfig = admitCanonicalConfig(parsed.canonicalConfig);
    if (
      worldSettings === undefined ||
      canonicalConfig === undefined ||
      !Value.Check(setupConfigSchema, parsed.setupConfig)
    ) {
      return null;
    }
    const setupConfig = freezeSnapshot(
      Value.Parse(setupConfigSchema, Value.Clone(parsed.setupConfig))
    );
    return {
      schemaVersion: 3,
      savedAt: parsed.savedAt,
      worldSettings,
      seed: parsed.seed,
      setupConfig,
      canonicalConfig,
    };
  } catch {
    return null;
  }
}

export function loadStudioAuthoringState(
  storage: KeyValueStorage | null = browserStorage()
): StudioAuthoringStateSnapshot | null {
  if (storage === null) return null;
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
  if (storage === null) return;
  const canonicalConfig = admitCanonicalConfig(args.canonicalConfig);
  if (canonicalConfig === undefined) return;
  try {
    storage.setItem(
      STUDIO_AUTHORING_STATE_KEY,
      JSON.stringify({
        schemaVersion: 3,
        savedAt: new Date().toISOString(),
        worldSettings: args.worldSettings,
        seed: args.seed,
        setupConfig: normalizeStudioSetupConfig(args.setupConfig),
        canonicalConfig: serializeMapConfigEnvelope(canonicalConfig),
      })
    );
  } catch {
    // Refresh recovery must not break live authoring.
  }
}
